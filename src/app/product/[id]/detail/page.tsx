'use client'; // บอก Next.js ว่าไฟล์นี้เป็น Client Component (ให้ทำงานที่ฝั่ง Browser เพื่อใช้ useState, useEffect ได้)
import { useState, useEffect, use } from 'react'; // นำเข้า Hook ของ React: useState(เก็บค่า), useEffect(ทำงานเมื่อโหลด), use(แกะค่าจาก Promise)
import Link from 'next/link'; // นำเข้า Link สำหรับทำลิงก์เปลี่ยนหน้าโดยไม่ต้องโหลดใหม่
import { Product } from '../../../../types/product'; // นำเข้า Type (รูปแบบข้อมูล) ของ Product เพื่อให้ TypeScript รู้โครงสร้างข้อมูล

// ประกาศฟังก์ชัน Component หลัก ชื่อ ProductDetail รับค่า params (ค่าพารามิเตอร์จาก URL) เข้ามา
export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  
  // แกะค่า id ออกมาจาก params (เนื่องจากใน Next.js รุ่นใหม่ params เป็น Promise จึงต้องใช้ hook 'use')
  const { id } = use(params);

  // สร้าง State ชื่อ product เพื่อเก็บข้อมูลสินค้า โดยเริ่มแรกให้เป็น null (ยังไม่มีข้อมูล)
  const [product, setProduct] = useState<Product | null>(null);

  // useEffect จะทำงานเมื่อ component ถูกโหลด หรือค่า id เปลี่ยนแปลง
  useEffect(() => {
    // สั่งให้ดึงข้อมูล (Fetch) จาก API หลังบ้าน ตาม id สินค้า
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json()) // แปลงข้อมูลที่ได้มาเป็น JSON
      .then(data => setProduct(data)) // นำข้อมูลที่ได้ไปเก็บใส่ State 'product'
      .catch(err => console.error(err)); // ถ้ามี error ให้แสดงใน console
  }, [id]);

  // Loading State: ถ้ายังไม่มีข้อมูลสินค้า (product เป็น null) ให้แสดงหน้านี้ก่อน
  if (!product) return (
    // จัดกึ่งกลางหน้าจอ
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      {/* วงกลมหมุนๆ (Spinner) สร้างจาก border */}
      <div className="w-14 h-14 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
      {/* ข้อความกระพริบ (animate-pulse) บอกสถานะ */}
      <div className="text-purple-400 font-bold animate-pulse tracking-tight">กำลังดึงข้อมูลสินค้า...</div>
    </div>
  );

  // ส่วนแสดงผลหลัก เมื่อมีข้อมูลสินค้าแล้ว
  return (
    // กล่องหลัก กำหนดความกว้างสูงสุด (max-w-2xl) และจัดกึ่งกลาง (mx-auto)
    <div className="max-w-2xl mx-auto mt-10 mb-20 px-4">
      
      {/* Breadcrumb: แถบนำทางด้านบน (หน้าหลัก / รายการสินค้า / รายละเอียด) */}
      <nav className="flex mb-6 text-sm font-medium text-purple-400 ml-2">
        <Link href="/" className="hover:text-purple-600 transition-colors">หน้าหลัก</Link>
        <span className="mx-2">/</span>
        <Link href="/product" className="hover:text-purple-600 transition-colors">รายการสินค้า</Link>
        <span className="mx-2">/</span>
        <span className="text-purple-900 font-bold">รายละเอียด</span>
      </nav>

      {/* กล่อง Card สีขาวขนาดใหญ่ ขอบมน ใส่เงา */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-purple-100 border border-purple-50 overflow-hidden">
        
        {/* ส่วนหัวของ Card: ชื่อหัวข้อ และ ปุ่มแก้ไข */}
        <div className="bg-purple-50/50 px-10 py-8 border-b border-purple-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-purple-900 uppercase tracking-widest">ข้อมูลสินค้า</h2>
          {/* ปุ่มแก้ไข: ลิงก์ไปยังหน้า edit ตาม id สินค้า */}
          <Link 
            href={`/product/${id}`}
            className="bg-white text-purple-600 px-5 py-2 rounded-2xl border border-purple-200 font-bold text-sm hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            ✏️ แก้ไข
          </Link>
        </div>
        
        {/* เนื้อหาภายใน Card */}
        <div className="p-10 space-y-8">

          {/* --- 1. เพิ่มส่วนแสดงรูปภาพ (ถ้ามี) --- */}
          {product.imageUrl && (
            <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border border-purple-100 shadow-md mb-6 relative group">
               <img 
                 src={product.imageUrl} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            </div>
          )}
          
          {/* แสดงชื่อสินค้า */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em]">Product Name</span>
            <span className="text-3xl font-black text-purple-950 leading-tight">{product.name}</span>
          </div>

          {/* แสดงราคาจำหน่าย */}
          <div className="flex justify-between items-center pt-6 border-t border-purple-50">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em]">Price</span>
            <div className="flex items-baseline gap-1">
                {/* แปลงตัวเลขราคาให้มีลูกน้ำคั่น (toLocaleString) */}
                <span className="text-4xl font-black text-violet-700">฿{product.price.toLocaleString()}</span>
                <span className="text-purple-400 font-bold text-sm">THB</span>
            </div>
          </div>

          {/* แสดงสีที่มีจำหน่าย */}
          <div className="pt-6 border-t border-purple-50">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em] block mb-4">Available Colors</span>
            <div className="flex gap-3 flex-wrap">
              {/* ตรวจสอบว่ามีข้อมูลสีไหม (product.colors) และความยาวมากกว่า 0 หรือไม่ */}
              {product.colors && product.colors.length > 0 ? (
                // ถ้ามีสี: วนลูป (map) เพื่อสร้างป้ายชื่อสี (Chip)
                product.colors.map(color => (
                  <div key={color} className="flex items-center gap-3 px-5 py-2.5 bg-white border-2 border-purple-100 text-purple-900 rounded-[1.25rem] text-sm font-black shadow-sm shadow-purple-50">
                    {/* วงกลมสีเล็กๆ หน้าชื่อสี กำหนดสีพื้นหลังตามชื่อสี */}
                    <div 
                        className="w-4 h-4 rounded-full border border-purple-200" 
                        style={{ backgroundColor: color.toLowerCase() }}
                    ></div>
                    {color} {/* ชื่อสี */}
                  </div>
                ))
              ) : (
                // ถ้าไม่มีข้อมูลสี: แสดงข้อความแจ้งเตือน
                <span className="text-purple-300 text-sm italic ml-1 font-medium">ไม่มีข้อมูลสีสินค้า</span>
              )}
            </div>
          </div>

          {/* แสดงรายละเอียดสินค้า (Description) */}
          <div className="pt-6 border-t border-purple-50">
            <span className="text-purple-300 text-xs font-black uppercase tracking-[0.2em] block mb-3">Description</span>
            {/* กล่องข้อความแบบ Quote มีเครื่องหมายคำพูดจางๆ ตกแต่ง */}
            <div className="bg-purple-50/30 p-8 rounded-[2.5rem] border border-purple-100/50 relative">
              <span className="absolute top-4 left-6 text-6xl text-purple-100 font-serif opacity-50">“</span>
              <p className="text-purple-900 leading-relaxed font-medium italic relative z-10 px-4">
                {/* แสดง description ถ้าไม่มีให้แสดงข้อความ default */}
                {product.description || 'ไม่มีข้อมูลรายละเอียดสินค้าเพิ่มเติม'}
              </p>
              <span className="absolute bottom-[-15px] right-6 text-6xl text-purple-100 font-serif opacity-50">”</span>
            </div>
          </div>

          {/* ปุ่มด้านล่างสำหรับกดกลับ */}
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