export type ColumnType = 'text' | 'number' | 'tag' | 'status';
export type ColumnAlign = 'left' | 'center' | 'right';
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

export interface TableColumn<T> {
  /** Tên field trong dữ liệu của dòng. */
  key: keyof T & string;
  title: string;
  /** Mặc định `text`. `number` tự canh phải và format dấu phân cách hàng nghìn. */
  type?: ColumnType;
  width?: string;
  align?: ColumnAlign;
  /** Cố định cột bên trái khi bảng cuộn ngang. Mặc định không cố định. Nên khai báo cho các cột liền nhau từ đầu bảng. */
  fixed?: boolean;
  /** `text`: hiện avatar chữ cái đầu bên cạnh giá trị. */
  avatar?: boolean;
  /** `text`: dòng phụ hiển thị bên dưới giá trị (ví dụ email dưới tên). */
  sub?: (row: T) => string;
  /** `tag`: màu của tag; trả về `undefined` để hiển thị chữ thường không có tag. */
  tagColor?: (row: T) => string | undefined;
  /** `tag`: nội dung hiển thị, mặc định là giá trị của field. */
  tagText?: (row: T) => string;
  /** `status`: ánh xạ `String(giá trị)` sang trạng thái và nhãn hiển thị. */
  statuses?: Record<string, { status: BadgeStatus; text: string }>;
}

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface TableFilter<T> {
  /** Định danh của ô lọc; với `select`/`number` mặc định cũng là tên field để so sánh. */
  key: string;
  /** Dùng làm placeholder và nhãn accessibility. */
  label: string;
  type: 'text' | 'select' | 'number';
  /** Danh sách lựa chọn, hoặc hàm sinh lựa chọn từ dữ liệu đang có. */
  options?: FilterOption[] | ((rows: T[]) => FilterOption[]);
  /** `text`: các field cần tìm (chứa, không phân biệt hoa thường). Mặc định là `key`. */
  searchKeys?: (keyof T & string)[];
  /** Tự định nghĩa điều kiện lọc, ghi đè cách so sánh mặc định. */
  match?: (row: T, value: unknown) => boolean;
  /** Chỉ hiện khi bấm nút tìm kiếm nâng cao. */
  advanced?: boolean;
}

export interface TableAction<T> {
  icon: string;
  /** Hiện khi rê chuột và dùng làm aria-label. */
  tooltip: string;
  danger?: boolean;
  handler: (row: T) => void;
}
