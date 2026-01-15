'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  
  // สถานะสำหรับการค้นหาและเรียงลำดับ (แพงไปถูกเป็นค่าเริ่มต้น)
  const [search, setSearch] = useState({ 
    name: '', 
    sort: 'desc' 
  });

  const fetchProducts = async () => {
    try {
      const query = new URLSearchParams();
      if (search.name.trim()) query.append('name', search.name);
      query.append('sort', search.sort);

      const res = await fetch(`http://localhost:3000/products/search?${query.toString()}`);
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) {
      try {
        const res = await fetch(`http://localhost:3000/products/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) fetchProducts();
      } catch (error) {
        console.error("Delete Error:", error);
      }
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans bg-purple-50/30 min-h-screen">
      
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-xl shadow-purple-100/50 border border-purple-50">
        <div>
          <h1 className="text-3xl font-black text-purple-900 tracking-tight">จัดการสต็อกสินค้า</h1>
          <p className="text-purple-400 text-sm font-medium">จัดการและตรวจสอบรายการสินค้าในระบบ</p>
        </div>
        <Link href="/product/create" className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-purple-200 font-bold active:scale-95">
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {/* Filter Bar Section */}
      <div className="flex gap-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-purple-100/50 border border-purple-50 items-center">
        <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300">🔍</span>
            <input 
              placeholder="ค้นหาชื่อสินค้าที่ต้องการ..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
              value={search.name}
              onChange={(e) => setSearch({...search, name: e.target.value})} 
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            />
        </div>
        <button 
          onClick={fetchProducts} 
          className="bg-purple-900 hover:bg-black text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-md active:scale-95"
        >
          ค้นหา
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden border border-purple-50 rounded-[2.5rem] shadow-2xl shadow-purple-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-50/50">
              <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider">ชื่อสินค้า</th>
              <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider">รายละเอียด</th>
              <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider">สีที่มี</th>
              <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider text-center">ราคา (แพงไปถูก)</th>
              <th className="p-5 text-center text-purple-900 font-black uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {products.map((p: any) => (
              <tr key={p._id} className="hover:bg-purple-50/30 transition-colors group">
                <td className="p-5">
                  <Link href={`/product/${p._id}/detail`} className="text-purple-600 font-black text-base hover:text-purple-800 transition-colors hover:underline decoration-2 underline-offset-4">
                    {p.name}
                  </Link>
                </td>
                <td className="p-5 text-slate-500 italic max-w-xs truncate">
                  {p.description || '-'}
                </td>
                <td className="p-5">
                  <div className="flex gap-2 flex-wrap">
                    {p.colors && p.colors.length > 0 ? (
                      p.colors.map((c: string) => (
                        <div 
                          key={c} 
                          className="w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-purple-100" 
                          style={{ backgroundColor: c.toLowerCase() }}
                          title={c}
                        ></div>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">ไม่มีข้อมูลสี</span>
                    )}
                  </div>
                </td>
                <td className="p-5 font-black text-violet-800 text-center text-base">
                    ฿{p.price.toLocaleString()}
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-4">
                    <Link 
                      href={`/product/${p._id}`} 
                      className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                    >
                      แก้ไข
                    </Link>
                    <button 
                      onClick={() => handleDelete(p._id, p.name)} 
                      className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="text-5xl mb-4 opacity-20">📦</div>
            <div className="text-purple-300 font-bold text-lg italic tracking-tight">
              ไม่พบรายการสินค้าที่คุณกำลังมองหา
            </div>
          </div>
        )}
      </div>

      {/* Back to Home Button */}
      <div className="flex justify-center pt-4">
        <Link href="/" className="text-purple-300 font-bold hover:text-purple-600 transition-colors flex items-center gap-2">
            <span>←</span> กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}


// // 'use client';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';

// export default function ProductList() {
//   const [products, setProducts] = useState([]);
  
//   const [search, setSearch] = useState({ 
//     name: '', 
//     sort: 'desc' 
//   });

//   const fetchProducts = async () => {
//     try {
//       const query = new URLSearchParams();
//       if (search.name.trim()) query.append('name', search.name);
//       query.append('sort', search.sort);

//       // --- เพิ่มการจำกัดราคาสูงสุดที่นี่ ---
//       query.append('maxPrice', '5000'); 
//       // --------------------------------

//       const res = await fetch(`http://localhost:3000/products/search?${query.toString()}`);
      
//       if (!res.ok) throw new Error('Network response was not ok');
//       const data = await res.json();
//       setProducts(data);
//     } catch (error) {
//       console.error("Fetch Error:", error);
//     }
//   };

//   const handleDelete = async (id: string, name: string) => {
//     if (confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) {
//       try {
//         const res = await fetch(`http://localhost:3000/products/${id}`, {
//           method: 'DELETE',
//         });
//         if (res.ok) fetchProducts();
//       } catch (error) {
//         console.error("Delete Error:", error);
//       }
//     }
//   };

//   useEffect(() => { fetchProducts(); }, []);

//   return (
//     <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans bg-purple-50/30 min-h-screen">
      
//       {/* Header Section */}
//       <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-xl shadow-purple-100/50 border border-purple-50">
//         <div>
//           <h1 className="text-3xl font-black text-purple-900 tracking-tight">จัดการสต็อกสินค้า</h1>
//           <p className="text-purple-400 text-sm font-medium">แสดงสินค้าเฉพาะราคาไม่เกิน 5,000 บาท</p>
//         </div>
//         <Link href="/product/create" className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-purple-200 font-bold active:scale-95">
//           + เพิ่มสินค้าใหม่
//         </Link>
//       </div>

//       {/* Filter Bar Section */}
//       <div className="flex gap-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-purple-100/50 border border-purple-50 items-center">
//         <div className="flex-1 relative">
//             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300">🔍</span>
//             <input 
//               placeholder="ค้นหาชื่อสินค้า (ราคาไม่เกิน 5,000)..." 
//               className="w-full pl-11 pr-4 py-3 rounded-2xl border border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
//               value={search.name}
//               onChange={(e) => setSearch({...search, name: e.target.value})} 
//               onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
//             />
//         </div>
//         <button 
//           onClick={fetchProducts} 
//           className="bg-purple-900 hover:bg-black text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-md active:scale-95"
//         >
//           ค้นหา
//         </button>
//       </div>

//       {/* Table Section */}
//       <div className="overflow-hidden border border-purple-50 rounded-[2.5rem] shadow-2xl shadow-purple-100 bg-white">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-purple-50/50">
//               <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider">ชื่อสินค้า</th>
//               <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider">รายละเอียด</th>
//               <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider">สีที่มี</th>
//               <th className="p-5 text-left text-purple-900 font-black uppercase tracking-wider text-center">ราคา (แพงไปถูก)</th>
//               <th className="p-5 text-center text-purple-900 font-black uppercase tracking-wider">จัดการ</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-purple-50">
//             {products.map((p: any) => (
//               <tr key={p._id} className="hover:bg-purple-50/30 transition-colors group">
//                 <td className="p-5">
//                   <Link href={`/product/${p._id}/detail`} className="text-purple-600 font-black text-base hover:text-purple-800 transition-colors hover:underline decoration-2 underline-offset-4">
//                     {p.name}
//                   </Link>
//                 </td>
//                 <td className="p-5 text-slate-500 italic max-w-xs truncate">
//                   {p.description || '-'}
//                 </td>
//                 <td className="p-5">
//                   <div className="flex gap-2 flex-wrap">
//                     {p.colors && p.colors.length > 0 ? (
//                       p.colors.map((c: string) => (
//                         <div 
//                           key={c} 
//                           className="w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-purple-100" 
//                           style={{ backgroundColor: c.toLowerCase() }}
//                           title={c}
//                         ></div>
//                       ))
//                     ) : (
//                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">ไม่มีข้อมูลสี</span>
//                     )}
//                   </div>
//                 </td>
//                 <td className="p-5 font-black text-violet-800 text-center text-base">
//                     ฿{p.price.toLocaleString()}
//                 </td>
//                 <td className="p-5">
//                   <div className="flex justify-center gap-4">
//                     <Link 
//                       href={`/product/${p._id}`} 
//                       className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
//                     >
//                       แก้ไข
//                     </Link>
//                     <button 
//                       onClick={() => handleDelete(p._id, p.name)} 
//                       className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
//                     >
//                       ลบ
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Empty State */}
//         {products.length === 0 && (
//           <div className="p-20 text-center flex flex-col items-center">
//             <div className="text-5xl mb-4 opacity-20">📦</div>
//             <div className="text-purple-300 font-bold text-lg italic tracking-tight">
//               ไม่พบรายการสินค้าราคาไม่เกิน 5,000 บาท
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Back to Home Button */}
//       <div className="flex justify-center pt-4">
//         <Link href="/" className="text-purple-300 font-bold hover:text-purple-600 transition-colors flex items-center gap-2">
//             <span>←</span> กลับสู่หน้าหลัก
//         </Link>
//       </div>
//     </div>
//   );
// }