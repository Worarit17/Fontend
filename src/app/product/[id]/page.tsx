'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '../../../types/product';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  
  // 1. เพิ่ม State สำหรับจัดการ Error ราคา
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const data: Product = await res.json();
          setName(data.name);
          setPrice(data.price.toString());
          setDescription(data.description || '');
          setColors(data.colors || []);
        }
      })
      .catch(err => console.error("Fetch error:", err));
  }, [id]);

  const addColor = (val: string) => {
    const trimmedValue = val.trim();
    if (trimmedValue && !colors.includes(trimmedValue)) {
      setColors([...colors, trimmedValue]);
      setColorInput('');
    }
  };

  const removeColor = (colorName: string) => {
    setColors(colors.filter(c => c !== colorName));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 2. ตรวจสอบราคาก่อนส่งข้อมูล (Validation)
    const numericPrice = Number(price);
    if (numericPrice > 5000) {
      setPriceError('ราคาต้องไม่เกิน 5,000 บาท');
      return; // หยุดการทำงาน ไม่ส่งข้อมูลไปยัง Server
    }

    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: numericPrice,
          description,
          colors
        }),
      });

      if (response.ok) {
        router.push('/product');
        router.refresh();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 mb-10 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-purple-100 border border-purple-50">
        <h1 className="text-2xl font-bold mb-8 text-purple-900 flex items-center gap-2">
          <span className="text-purple-500">📝</span> แก้ไขข้อมูลสินค้า
        </h1>
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* ชื่อสินค้า */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ชื่อสินค้า</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              placeholder="กรอกชื่อสินค้า"
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all" 
            />
          </div>

          {/* ราคา (เพิ่มการจัดการ Error และ Max value) */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ราคา (สูงสุด 5,000 บาท)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => {
                setPrice(e.target.value);
                // ล้าง error ทันทีเมื่อผู้ใช้แก้ไขราคาให้ถูกต้อง
                if (Number(e.target.value) <= 5000) setPriceError('');
              }} 
              max="5000" // จำกัดค่าสูงสุดที่ฝั่ง HTML
              required
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                priceError ? 'border-rose-400 focus:ring-rose-50' : 'border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300'
              }`} 
            />
            {priceError && (
              <p className="text-rose-500 text-xs mt-1.5 ml-1 font-bold animate-pulse">
                ✕ {priceError}
              </p>
            )}
          </div>

          {/* ส่วนจัดการสี */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">จัดการสี</label>
            <input 
              type="text" 
              value={colorInput} 
              onChange={e => setColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addColor(colorInput);
                }
              }}
              onBlur={() => addColor(colorInput)}
              placeholder="พิมพ์สีแล้วกด Enter..." 
              className="w-full px-4 py-3 border border-purple-100 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm placeholder:text-slate-300" 
            />
            
            <div className="flex flex-wrap gap-2 mt-3">
              {colors.map(c => (
                <span key={c} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-100 flex items-center gap-2">
                  {c} 
                  <button 
                    type="button" 
                    onClick={() => removeColor(c)} 
                    className="text-purple-300 hover:text-rose-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">รายละเอียด</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
              placeholder="รายละเอียดสินค้า..."
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all resize-none placeholder:text-slate-300" 
            />
          </div>

          {/* ปุ่มบันทึกและยกเลิก */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-[2] bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:to-violet-800 transition-all shadow-lg active:scale-[0.98]"
            >
              บันทึกการแก้ไข
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





// // src/app/product/[id]/page.tsx
// 'use client';
// import { useState, useEffect, use } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Product } from '../../../types/product';

// export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);
//   const router = useRouter();
  
//   const [name, setName] = useState('');
//   const [price, setPrice] = useState('');
//   const [description, setDescription] = useState('');
//   const [colors, setColors] = useState<string[]>([]);
//   const [colorInput, setColorInput] = useState('');

//   useEffect(() => {
//     fetch(`http://localhost:3000/products/${id}`)
//       .then(async (res) => {
//         if (res.ok) {
//           const data: Product = await res.json();
//           setName(data.name);
//           setPrice(data.price.toString());
//           setDescription(data.description || '');
//           setColors(data.colors || []);
//         }
//       })
//       .catch(err => console.error("Fetch error:", err));
//   }, [id]);

//   // ฟังก์ชันเพิ่มสี (ปรับปรุง: รับค่าโดยตรงและไม่ต้องใช้ปุ่ม)
//   const addColor = (val: string) => {
//     const trimmedValue = val.trim();
//     if (trimmedValue && !colors.includes(trimmedValue)) {
//       setColors([...colors, trimmedValue]);
//       setColorInput('');
//     }
//   };

//   const removeColor = (colorName: string) => {
//     setColors(colors.filter(c => c !== colorName));
//   };

//   const handleUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`http://localhost:3000/products/${id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name,
//           price: Number(price),
//           description,
//           colors
//         }),
//       });

//       if (response.ok) {
//         router.push('/product');
//         router.refresh();
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 mb-10 px-4">
//       <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-purple-100 border border-purple-50">
//         <h1 className="text-2xl font-bold mb-8 text-purple-900 flex items-center gap-2">
//           <span className="text-purple-500">📝</span> แก้ไขข้อมูลสินค้า
//         </h1>
//         <form onSubmit={handleUpdate} className="space-y-6">
//           {/* ชื่อสินค้า */}
//           <div>
//             <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ชื่อสินค้า</label>
//             <input 
//               type="text" 
//               value={name} 
//               onChange={e => setName(e.target.value)} 
//               required
//               placeholder="กรอกชื่อสินค้า"
//               className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all" 
//             />
//           </div>

//           {/* ราคา */}
//           <div>
//             <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ราคา (บาท)</label>
//             <input 
//               type="number" 
//               value={price} 
//               onChange={e => setPrice(e.target.value)} 
//               required
//               placeholder="0.00"
//               className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all" 
//             />
//           </div>

//           {/* ส่วนจัดการสี (แก้ไข: ไม่มีปุ่ม พิมพ์แล้ว Enter หรือคลิกออก) */}
//           <div>
//             <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">จัดการสี</label>
//             <input 
//               type="text" 
//               value={colorInput} 
//               onChange={e => setColorInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                   addColor(colorInput);
//                 }
//               }}
//               onBlur={() => addColor(colorInput)} // เพิ่มสีอัตโนมัติเมื่อคลิกออกจากช่อง
//               placeholder="พิมพ์สีแล้วกด Enter..." 
//               className="w-full px-4 py-3 border border-purple-100 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm placeholder:text-slate-300" 
//             />
            
//             <div className="flex flex-wrap gap-2 mt-3">
//               {colors.map(c => (
//                 <span key={c} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-100 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
//                   {c} 
//                   <button 
//                     type="button" 
//                     onClick={() => removeColor(c)} 
//                     className="text-purple-300 hover:text-rose-500 transition-colors"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
//                   </button>
//                 </span>
//               ))}
//               {colors.length === 0 && <p className="text-[11px] text-slate-400 ml-1 italic font-medium">ยังไม่มีข้อมูลสี</p>}
//             </div>
//           </div>

//           {/* รายละเอียด */}
//           <div>
//             <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">รายละเอียด</label>
//             <textarea 
//               value={description} 
//               onChange={e => setDescription(e.target.value)} 
//               rows={3}
//               placeholder="รายละเอียดสินค้า..."
//               className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all resize-none placeholder:text-slate-300" 
//             />
//           </div>

//           {/* ปุ่มบันทึกและยกเลิก */}
//           <div className="flex gap-3 pt-4">
//             <button 
//               type="submit" 
//               className="flex-[2] bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:to-violet-800 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
//             >
//               บันทึกการแก้ไข
//             </button>
//             <Link 
//               href="/product" 
//               className="flex-1 text-center bg-purple-50 text-purple-600 font-bold py-4 rounded-2xl hover:bg-purple-100 transition-all border border-purple-100 active:scale-[0.98]"
//             >
//               ยกเลิก
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }