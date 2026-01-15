'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Product } from '../../../../types/product';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err));
  }, [id]);

  // Loading State แบบสวยงาม
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-14 h-14 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
      <div className="text-purple-400 font-bold animate-pulse tracking-tight">กำลังดึงข้อมูลสินค้า...</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 px-4">
      {/* Breadcrumb เพื่อให้ผู้ใช้รู้ว่าอยู่ที่ไหน */}
      <nav className="flex mb-6 text-sm font-medium text-purple-400 ml-2">
        <Link href="/" className="hover:text-purple-600 transition-colors">หน้าหลัก</Link>
        <span className="mx-2">/</span>
        <Link href="/product" className="hover:text-purple-600 transition-colors">รายการสินค้า</Link>
        <span className="mx-2">/</span>
        <span className="text-purple-900 font-bold">รายละเอียด</span>
      </nav>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-purple-100 border border-purple-50 overflow-hidden">
        {/* Header Section พร้อมปุ่มแก้ไขด่วน */}
        <div className="bg-purple-50/50 px-10 py-8 border-b border-purple-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-purple-900 uppercase tracking-widest">ข้อมูลสินค้า</h2>
          <Link 
            href={`/product/${id}`}
            className="bg-white text-purple-600 px-5 py-2 rounded-2xl border border-purple-200 font-bold text-sm hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            ✏️ แก้ไข
          </Link>
        </div>
        
        <div className="p-10 space-y-8">
          {/* ชื่อสินค้า */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em]">Product Name</span>
            <span className="text-3xl font-black text-purple-950 leading-tight">{product.name}</span>
          </div>

          {/* ราคาจำหน่าย */}
          <div className="flex justify-between items-center pt-6 border-t border-purple-50">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em]">Price</span>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-violet-700">฿{product.price.toLocaleString()}</span>
                <span className="text-purple-400 font-bold text-sm">THB</span>
            </div>
          </div>

          {/* สีที่มีจำหน่าย */}
          <div className="pt-6 border-t border-purple-50">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em] block mb-4">Available Colors</span>
            <div className="flex gap-3 flex-wrap">
              {product.colors && product.colors.length > 0 ? (
                product.colors.map(color => (
                  <div key={color} className="flex items-center gap-3 px-5 py-2.5 bg-white border-2 border-purple-100 text-purple-900 rounded-[1.25rem] text-sm font-black shadow-sm shadow-purple-50">
                    <div 
                        className="w-4 h-4 rounded-full border border-purple-200" 
                        style={{ backgroundColor: color.toLowerCase() }}
                    ></div>
                    {color}
                  </div>
                ))
              ) : (
                <span className="text-purple-300 text-sm italic ml-1 font-medium">ไม่มีข้อมูลสีสินค้า</span>
              )}
            </div>
          </div>

          {/* รายละเอียดสินค้า */}
          <div className="pt-6 border-t border-purple-50">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em] block mb-3">Description</span>
            <div className="bg-purple-50/30 p-8 rounded-[2.5rem] border border-purple-100/50 relative">
              <span className="absolute top-4 left-6 text-6xl text-purple-100 font-serif opacity-50">“</span>
              <p className="text-purple-900 leading-relaxed font-medium italic relative z-10 px-4">
                {product.description || 'ไม่มีข้อมูลรายละเอียดสินค้าเพิ่มเติม'}
              </p>
              <span className="absolute bottom-[-15px] right-6 text-6xl text-purple-100 font-serif opacity-50">”</span>
            </div>
          </div>

          {/* ปุ่มการนำทางด้านล่าง */}
          <div className="grid grid-cols-1 gap-4 mt-10 pt-4">
            <Link 
              href="/product" 
              className="flex items-center justify-center gap-2 bg-purple-900 text-white font-black py-4 rounded-[1.5rem] hover:bg-black transition-all shadow-xl shadow-purple-200 active:scale-95"
            >
              <span>←</span> กลับสู่หน้ารายการสินค้า
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}