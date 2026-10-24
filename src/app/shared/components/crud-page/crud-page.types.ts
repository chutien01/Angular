export type PageActionType = 'primary' | 'default' | 'dashed';

/** Các thao tác của trang CRUD mà nút trên đầu trang có thể gọi. */
export interface CrudPageApi<T> {
  /** Mở form thêm mới (modal hoặc inline tùy `formMode`). */
  create(): void;
  /** Tải lại dữ liệu từ API. */
  reload(): void;
  /** Dữ liệu đang có trên trang. */
  data(): T[];
}

/** Nút hiển thị bên phải, cùng hàng với tiêu đề trang. */
export interface PageAction<T> {
  label: string;
  icon?: string;
  /** Mặc định `default`. */
  type?: PageActionType;
  danger?: boolean;
  handler: (page: CrudPageApi<T>) => void;
}
