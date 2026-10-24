import { FormControl } from '@angular/forms';

export type CrudFormMode = 'modal_form' | 'inline_form';
export type CrudFormAction = 'create' | 'edit' | 'view';
/** Các loại field có sẵn; mọi loại khác dùng `custom` kèm template `appCrudField`. */
export type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'switch' | 'custom';

export interface FormFieldOption {
  label: string;
  value: string | number | boolean;
}

export interface FormField<T> {
  /** Tên field trong dữ liệu, cũng là tên control trong form. */
  key: keyof T & string;
  label: string;
  /** `custom`: giao diện lấy từ `<ng-template appCrudField="key">` khai báo trong trang. */
  type: FormFieldType;
  /** Độ rộng trên lưới 24 cột: 24 = cả hàng, 12 = nửa hàng (mặc định), 8 = một phần ba... */
  span?: number;
  required?: boolean;
  placeholder?: string;
  /** `select`: danh sách lựa chọn. */
  options?: FormFieldOption[];
  /** `switch`: nhãn hiển thị ở chế độ xem chi tiết cho [bật, tắt]. Mặc định ['Có', 'Không']. */
  switchLabels?: [string, string];
  /** `number`: giới hạn và bước nhảy. */
  min?: number;
  max?: number;
  step?: number;
  /** `text` / `email` / `textarea`: số ký tự tối đa. */
  maxLength?: number;
  /** Giá trị khởi tạo khi thêm mới. */
  defaultValue?: unknown;
  /** Tự định dạng giá trị ở chế độ xem chi tiết (nên khai báo cho field `custom`). */
  display?: (value: unknown) => string;
}

/** Biến có sẵn trong `<ng-template appCrudField="key" let-control let-id="id" let-field="field">`. */
export interface CrudFieldContext {
  /** FormControl của field — gắn vào control bằng `[formControl]="control"`. */
  $implicit: FormControl<unknown>;
  control: FormControl<unknown>;
  /** Id gắn vào control (`[id]` / `[nzId]`) để nhãn của field trỏ đúng tới nó. */
  id: string;
  field: FormField<object>;
}
