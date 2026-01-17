'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const productSchema = z.object({
  name: z.string()
    .min(3, 'ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'ชื่อสินค้าต้องไม่เกิน 50 ตัวอักษร'),
  price: z.coerce.number()
    .min(1, 'ราคาต้องมากกว่า 0')
    .max(100000, 'ราคาต้องไม่เกิน 100,000 บาท')
    .nonnegative('ราคาต้องไม่เป็นลบ'),
  description: z.string()
    .min(5, 'รายละเอียดต้องมีอย่างน้อย 5 ตัวอักษร')
    .max(200, 'รายละเอียดต้องไม่เกิน 200 ตัวอักษร'),
  colors: z.array(z.string()),
  // --- 1. เพิ่ม Validation สำหรับรูปภาพ (Optional) ---
  imageUrl: z.string().optional(),
});

export default function CreateProduct() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // State สำหรับการแก้ไขสี (Double Click)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // --- 2. เพิ่ม State สำหรับ Preview รูปภาพ ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      colors: [],
      imageUrl: '', // เพิ่ม default value
    }
  });

  const nameValue = watch('name', '');
  const descValue = watch('description', '');

  // --- 3. ฟังก์ชันจัดการรูปภาพ (แปลงไฟล์เป็น Base64) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setValue('imageUrl', base64String); // เก็บค่าลงฟอร์ม
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('imageUrl', '');
  };

  const addColor = (val: string) => {
    if (!val.trim()) return;

    // แยกข้อความด้วยเครื่องหมายคอมม่า (,)
    const inputs = val.split(',');
    
    const newAddedColors = [...selectedColors];
    
    inputs.forEach(item => {
      const trimmedValue = item.trim();
      if (trimmedValue && !newAddedColors.includes(trimmedValue)) {
        newAddedColors.push(trimmedValue);
      }
    });

    setSelectedColors(newAddedColors);
    setValue('colors', newAddedColors);
    setColorInput('');
  };

  const removeColor = (colorToRemove: string) => {
    const newColors = selectedColors.filter(c => c !== colorToRemove);
    setSelectedColors(newColors);
    setValue('colors', newColors);
  };

  // ฟังก์ชันบันทึกการแก้ไขสี (รองรับการแยกคอมม่า)
  const saveEditColor = (index: number) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      // แยกข้อความด้วยคอมม่า
      const splitItems = trimmed.split(',').map(item => item.trim()).filter(item => item !== "");
      
      const newColors = [...selectedColors];
      
      // แทนที่ตำแหน่งเดิมด้วยสีแรกที่พิมพ์มา
      if (splitItems.length > 0) {
        newColors[index] = splitItems[0];
        
        // ถ้าพิมพ์มามากกว่า 1 สี (เช่น แก้แดง เป็น เขียว,น้ำเงิน) ให้เพิ่มสีที่เหลือต่อท้าย
        if (splitItems.length > 1) {
          const extraItems = splitItems.slice(1).filter(item => !newColors.includes(item));
          newColors.push(...extraItems);
        }
        
        setSelectedColors(newColors);
        setValue('colors', newColors);
      }
    }
    setEditingIndex(null);
  };

  const onSubmit: SubmitHandler<z.output<typeof productSchema>> = async (data) => {
    setServerError(null);
    try {
      await axios.post('http://localhost:3000/products', data); 
      router.push('/product');
      router.refresh();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 mb-10 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-purple-100 border border-purple-50">
        <h1 className="text-2xl font-bold mb-8 text-purple-900 flex items-center gap-2">
          <span className="text-purple-500">🔮</span> เพิ่มสินค้าใหม่
        </h1>

        {serverError && (
          <div className="bg-rose-50 border-l-4 border-rose-400 p-4 mb-6 text-rose-700 text-sm rounded-r-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* --- 4. ส่วน UI สำหรับอัปโหลดรูปภาพ (เพิ่มใหม่) --- */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-2">รูปภาพสินค้า</label>
            <div className="flex items-center justify-center w-full">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-purple-200 border-dashed rounded-2xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-purple-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="text-xs text-purple-500 font-bold">คลิกเพื่ออัปโหลดรูปภาพ</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              ) : (
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-purple-200 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ชื่อสินค้า */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-sm font-bold text-purple-950">ชื่อสินค้า</label>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-full">{nameValue.length}/50</span>
            </div>
            <input
              type="text"
              {...register('name')}
              placeholder="เช่น Gaming Mouse"
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all text-black placeholder:text-gray-500"
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-medium italic">✕ {errors.name.message}</p>}
          </div>

          {/* ราคา */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ราคา</label>
            <input
              type="number"
              {...register('price')}
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all text-black placeholder:text-gray-500 ${errors.price ? 'border-rose-300 focus:ring-rose-50' : 'border-purple-100 focus:ring-purple-50 focus:border-purple-300'}`}
            />
            {errors.price && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-bold italic animate-pulse">✕ {errors.price.message}</p>}
          </div>

          {/* การจัดการสี */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">สีที่มีจำหน่าย (พิมพ์ "แดง,เขียว" แล้ว Enter)</label>
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor(colorInput))}
              onBlur={() => addColor(colorInput)}
              placeholder="ป้อนชื่อสี..."
              className="w-full px-4 py-3 border border-purple-100 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all text-black placeholder:text-gray-500"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedColors.map((color, index) => (
                <span 
                  key={index} 
                  className="bg-purple-100 text-purple-900 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-2"
                >
                  {/* Logic การสลับระหว่างโหมดแสดงผล และโหมดแก้ไข (Input) */}
                  {editingIndex === index ? (
                    <input
                      autoFocus
                      className="w-20 bg-transparent outline-none border-b border-purple-400 text-black p-0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEditColor(index)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), saveEditColor(index))}
                    />
                  ) : (
                    <span 
                      onDoubleClick={() => {
                        setEditingIndex(index);
                        setEditValue(color);
                      }}
                      className="cursor-pointer hover:text-purple-700"
                      title="ดับเบิลคลิกเพื่อแก้ไข"
                    >
                      {color}
                    </span>
                  )}
                  
                  <button type="button" onClick={() => removeColor(color)} className="text-purple-400 hover:text-rose-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
              {selectedColors.length === 0 && <p className="text-[11px] text-slate-400 ml-1 italic font-medium">ยังไม่ได้ระบุสี</p>}
            </div>
          </div>

          {/* รายละเอียด */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-sm font-bold text-purple-950">รายละเอียด</label>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-full">{descValue.length}/200</span>
            </div>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="กรอกรายละเอียดสินค้า..."
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 outline-none resize-none focus:ring-4 focus:ring-purple-50 text-black placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-[2] bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:to-violet-800 transition-all shadow-lg active:scale-[0.98]"
            >
              บันทึกสินค้า
            </button>
            <Link
              href="/product"
              className="flex-1 text-center bg-purple-50 text-purple-600 font-bold py-4 rounded-2xl border border-purple-100 transition-all"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}




// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import axios from 'axios';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';

// const productSchema = z.object({
//   name: z.string()
//     .min(3, 'ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร')
//     .max(50, 'ชื่อสินค้าต้องไม่เกิน 50 ตัวอักษร'),
//   price: z.coerce.number()
//     .min(1, 'ราคาต้องมากกว่า 0')
//     .nonnegative('ราคาต้องไม่เป็นลบ'),
//   description: z.string()
//     .min(5, 'รายละเอียดต้องมีอย่างน้อย 5 ตัวอักษร')
//     .max(200, 'รายละเอียดต้องไม่เกิน 200 ตัวอักษร'),
//   colors: z.array(z.string()), 
// });

// export default function CreateProduct() {
//   const router = useRouter();
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [colorInput, setColorInput] = useState('');
//   const [selectedColors, setSelectedColors] = useState<string[]>([]);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     // @ts-ignore
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       colors: [],
//     }
//   });

//   const nameValue = watch('name', '');
//   const descValue = watch('description', '');

//   // ฟังก์ชันเพิ่มสี (ปรับให้ไม่มีปุ่มเรียกใช้)
//   const addColor = (val: string) => {
//     const trimmedValue = val.trim();
//     if (trimmedValue && !selectedColors.includes(trimmedValue)) {
//       const newColors = [...selectedColors, trimmedValue];
//       setSelectedColors(newColors);
//       setValue('colors', newColors);
//       setColorInput('');
//     }
//   };

//   const removeColor = (colorToRemove: string) => {
//     const newColors = selectedColors.filter(c => c !== colorToRemove);
//     setSelectedColors(newColors);
//     setValue('colors', newColors);
//   };

//   const onSubmit: SubmitHandler<z.output<typeof productSchema>> = async (data) => {
//     setServerError(null);
//     try {
//       await axios.post('http://localhost:3000/products', data); 
//       router.push('/product');
//       router.refresh();
//     } catch (error: any) {
//       const msg = error.response?.data?.message;
//       setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 mb-10 px-4">
//       <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-purple-100 border border-purple-50">
//         <h1 className="text-2xl font-bold mb-8 text-purple-900 flex items-center gap-2">
//           <span className="text-purple-500">🔮</span> เพิ่มสินค้าใหม่
//         </h1>

//         {serverError && (
//           <div className="bg-rose-50 border-l-4 border-rose-400 p-4 mb-6 text-rose-700 text-sm rounded-r-lg">
//             {serverError}
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* ชื่อสินค้า */}
//           <div>
//             <div className="flex justify-between items-center mb-1.5 ml-1">
//               <label className="text-sm font-bold text-purple-950">ชื่อสินค้า</label>
//               <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-full">{nameValue.length}/50</span>
//             </div>
//             <input
//               type="text"
//               {...register('name')}
//               placeholder="เช่น Gaming Mouse"
//               className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all placeholder:text-slate-300"
//             />
//             {errors.name && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-medium">✕ {errors.name.message}</p>}
//           </div>

//           {/* ราคา */}
//           <div>
//             <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ราคา (บาท)</label>
//             <input
//               type="number"
//               {...register('price')}
//               placeholder="0.00"
//               className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all placeholder:text-slate-300"
//             />
//             {errors.price && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-medium">✕ {errors.price.message}</p>}
//           </div>

//           {/* การจัดการสี (แก้ไข: ไม่มีปุ่มกด พิมพ์แล้ว Enter) */}
//           <div>
//             <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">สีที่มีจำหน่าย</label>
//             <input
//               type="text"
//               value={colorInput}
//               onChange={(e) => setColorInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                   addColor(colorInput);
//                 }
//               }}
//               onBlur={() => addColor(colorInput)} // เพิ่มสีเมื่อคลิกที่อื่น
//               placeholder="พิมพ์สีแล้วกด Enter..."
//               className="w-full px-4 py-3 border border-purple-100 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm placeholder:text-slate-300"
//             />
            
//             <div className="flex flex-wrap gap-2 mt-3">
//               {selectedColors.map((color) => (
//                 <span key={color} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-100 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
//                   {color}
//                   <button 
//                     type="button" 
//                     onClick={() => removeColor(color)} 
//                     className="text-purple-300 hover:text-rose-500 transition-colors"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
//                   </button>
//                 </span>
//               ))}
//               {selectedColors.length === 0 && <p className="text-[11px] text-slate-400 ml-1 italic font-medium tracking-wide">ยังไม่ได้ระบุสี</p>}
//             </div>
//           </div>

//           {/* รายละเอียด */}
//           <div>
//             <div className="flex justify-between items-center mb-1.5 ml-1">
//               <label className="text-sm font-bold text-purple-950">รายละเอียด</label>
//               <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-full">{descValue.length}/200</span>
//             </div>
//             <textarea
//               {...register('description')}
//               rows={3}
//               placeholder="กรอกรายละเอียดสินค้า..."
//               className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all placeholder:text-slate-300 resize-none"
//             />
//             {errors.description && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-medium">✕ {errors.description.message}</p>}
//           </div>

//           {/* ปุ่มกด */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               className="flex-[2] bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:to-violet-800 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
//             >
//               บันทึกสินค้า
//             </button>
//             <Link
//               href="/product"
//               className="flex-1 text-center bg-purple-50 text-purple-600 font-bold py-4 rounded-2xl hover:bg-purple-100 transition-all active:scale-[0.98] border border-purple-100"
//             >
//               ยกเลิก
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
