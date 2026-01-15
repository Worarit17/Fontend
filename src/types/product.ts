// src/types/product.ts 
// Define the Product interface to type the product data 
export interface Product {
  _id: string; // MongoDB ใช้ _id และเป็น string
  name: string;
  price: number;
  description: string;
  colors: string[]; // เพิ่มฟิลด์สี
  createdAt?: string;
  updatedAt?: string;
}