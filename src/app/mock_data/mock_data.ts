import { Product } from '../core/models/product.model';
import { User } from '../core/models/user.model';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', role: 'admin', active: true },
  { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@example.com', role: 'editor', active: true },
  { id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@example.com', role: 'viewer', active: false },
  { id: 4, name: 'Phạm Minh Dũng', email: 'dung.pham@example.com', role: 'editor', active: true },
  { id: 5, name: 'Võ Thu Hà', email: 'ha.vo@example.com', role: 'viewer', active: true },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Bàn phím cơ', category: 'Phụ kiện', price: 1200000, stock: 25 },
  { id: 2, name: 'Chuột không dây', category: 'Phụ kiện', price: 450000, stock: 60 },
  { id: 3, name: 'Màn hình 27"', category: 'Màn hình', price: 5800000, stock: 12 },
  { id: 4, name: 'Laptop 14"', category: 'Laptop', price: 18500000, stock: 8 },
  { id: 5, name: 'Tai nghe Bluetooth', category: 'Âm thanh', price: 990000, stock: 40 },
];

/** Dữ liệu ban đầu của từng "bảng" mà mock API phục vụ, key trùng với đường dẫn /api/<key>. */
export const MOCK_DB: Record<string, { id: number }[]> = {
  users: MOCK_USERS,
  products: MOCK_PRODUCTS,
};
