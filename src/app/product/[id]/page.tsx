// src/app/product/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import { Product } from '../../../types/product'; // สมมติว่า path นี้ถูกต้อง

// Type สำหรับ Product (ถ้าไม่ได้ import มา)
type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  colors?: string[];
  imageUrl?: string; // เพิ่ม field นี้
};

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  // 1. เพิ่ม State สำหรับเก็บ URL รูปภาพ (ทั้งรูปเดิม หรือรูปใหม่ที่เป็น Base64)
  const [imageUrl, setImageUrl] = useState('');

  // ดึงข้อมูลสินค้าเดิมมาแสดง
  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const data: Product = await res.json();
          setName(data.name);
          setPrice(data.price.toString());
          setDescription(data.description || '');
          setColors(data.colors || []);
          // 2. ดึง URL รูปภาพเดิมมาใส่ State ถ้ามี
          setImageUrl(data.imageUrl || '');
        }
      })
      .catch(err => console.error("Fetch error:", err));
  }, [id]);

  // 3. ฟังก์ชันจัดการเมื่อผู้ใช้เลือกไฟล์รูปภาพใหม่ (แปลงเป็น Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (ตัวอย่าง: ไม่เกิน 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // เมื่อแปลงเสร็จ ให้เอา Base64 string ไปแทนที่ใน State imageUrl เลย
        const base64String = reader.result as string;
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // ฟังก์ชันลบรูปภาพ (เคลียร์ State)
  const removeImage = () => {
    setImageUrl('');
  };

  // ฟังก์ชันจัดการสี
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

  // ฟังก์ชันบันทึกการแก้ไข
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PATCH', // ใช้ PATCH สำหรับการแก้ไขบางส่วน
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          colors,
          // 4. ส่งข้อมูลรูปภาพล่าสุดใน State ไปอัปเดต
          imageUrl: imageUrl 
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
          
          {/* 5. ส่วน UI สำหรับแสดงและแก้ไขรูปภาพ */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-2">รูปภาพสินค้า</label>
            <div className="flex items-center justify-center w-full">
              {/* เงื่อนไข: ถ้าไม่มี URL รูป (imageUrl เป็นว่าง) ให้แสดงช่องอัปโหลด */}
              {!imageUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-purple-200 border-dashed rounded-2xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors relative group">
                   {/* ไอคอนและข้อความอัปโหลด */}
                   <div className="flex flex-col items-center justify-center pt-5 pb-6 transition-opacity group-hover:opacity-70">
                      <svg className="w-10 h-10 mb-3 text-purple-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-sm text-purple-500 font-bold">คลิกเพื่ออัปโหลดรูปใหม่</p>
                      <p className="text-xs text-purple-400 mt-1">PNG, JPG (ไม่เกิน 2MB)</p>
                   </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              ) : (
                // เงื่อนไข: ถ้ามี URL รูป (ไม่ว่าของเดิม หรือที่เพิ่งเลือกใหม่) ให้แสดงพรีวิว
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-purple-200 group shadow-sm">
                  {/* แสดงรูปภาพ */}
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  
                  {/* ปุ่มกากบาท (X) สำหรับลบรูป */}
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white/80 text-rose-500 p-2 rounded-full shadow-md hover:bg-white hover:text-rose-600 transition-all backdrop-blur-sm"
                    title="ลบรูปภาพ"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                   {/* แถบแจ้งเตือนเล็กๆ ว่านี่คือรูปปัจจุบัน */}
                   <div className="absolute bottom-0 left-0 right-0 bg-purple-900/60 text-white text-[10px] py-1 text-center backdrop-blur-sm">
                      รูปภาพปัจจุบัน (คลิก X เพื่อเปลี่ยน)
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* ชื่อสินค้า */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ชื่อสินค้า</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              placeholder="กรอกชื่อสินค้า"
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all text-purple-900" 
            />
          </div>

          {/* ราคา */}
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-1.5 ml-1">ราคา (บาท)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              required
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all text-purple-900" 
            />
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
              className="w-full px-4 py-3 border border-purple-100 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm placeholder:text-slate-300 text-purple-900" 
            />
            
            <div className="flex flex-wrap gap-2 mt-3">
              {colors.map(c => (
                <span key={c} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-100 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
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
              {colors.length === 0 && <p className="text-[11px] text-slate-400 ml-1 italic font-medium">ยังไม่มีข้อมูลสี</p>}
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
              className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all resize-none placeholder:text-slate-300 text-purple-900" 
            />
          </div>

          {/* ปุ่มบันทึกและยกเลิก */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-[2] bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:to-violet-800 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
            >
              บันทึกการแก้ไข
            </button>
            <Link 
              href="/product" 
              className="flex-1 text-center bg-purple-50 text-purple-600 font-bold py-4 rounded-2xl hover:bg-purple-100 transition-all border border-purple-100 active:scale-[0.98]"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}