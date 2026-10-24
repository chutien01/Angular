import { Component, inject } from '@angular/core';
import { User, UserRole } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { FormField } from '../../shared/components/crud-form/crud-form.types';
import { CrudPage } from '../../shared/components/crud-page/crud-page';
import { PageAction } from '../../shared/components/crud-page/crud-page.types';
import { TableColumn, TableFilter } from '../../shared/components/data-table/data-table.types';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'admin', value: 'admin' },
  { label: 'editor', value: 'editor' },
  { label: 'viewer', value: 'viewer' },
];
const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'geekblue',
  editor: 'purple',
  viewer: 'default',
};
const DEPARTMENT_OPTIONS = [
  'Ban giám đốc',
  'Marketing',
  'Kinh doanh',
  'Kỹ thuật',
  'Chăm sóc khách hàng',
].map((department) => ({ label: department, value: department }));
const STATUS_OPTIONS = [
  { label: 'Hoạt động', value: true },
  { label: 'Đã khóa', value: false },
];

@Component({
  selector: 'app-user-list',
  imports: [CrudPage],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  protected readonly service = inject(UserService);

  /** Nút bên phải tiêu đề trang; thêm nút mới chỉ cần thêm phần tử vào mảng này. */
  protected readonly pageActions: PageAction<User>[] = [
    { label: 'Thêm người dùng', icon: 'plus', type: 'primary', handler: (page) => page.create() },
  ];

  /** `fixed: true` cố định cột bên trái khi bảng cuộn ngang (cột Thao tác luôn cố định bên phải). */
  protected readonly columns: TableColumn<User>[] = [
    {
      key: 'name',
      title: 'Người dùng',
      width: '260px',
      fixed: true,
      avatar: true,
      sub: (user) => user.email,
    },
    { key: 'phone', title: 'Số điện thoại', width: '150px' },
    { key: 'department', title: 'Phòng ban', width: '200px' },
    { key: 'address', title: 'Địa chỉ', width: '320px' },
    {
      key: 'role',
      title: 'Vai trò',
      width: '120px',
      type: 'tag',
      tagColor: (user) => ROLE_COLORS[user.role],
    },
    {
      key: 'active',
      title: 'Trạng thái',
      width: '140px',
      type: 'status',
      statuses: {
        true: { status: 'success', text: 'Hoạt động' },
        false: { status: 'error', text: 'Đã khóa' },
      },
    },
  ];

  protected readonly filters: TableFilter<User>[] = [
    {
      key: 'keyword',
      label: 'Tìm theo tên hoặc email',
      type: 'text',
      searchKeys: ['name', 'email'],
    },
    { key: 'role', label: 'Vai trò', type: 'select', options: ROLE_OPTIONS },
    { key: 'active', label: 'Trạng thái', type: 'select', advanced: true, options: STATUS_OPTIONS },
    { key: 'email', label: 'Email chứa', type: 'text', advanced: true },
  ];

  protected readonly fields: FormField<User>[] = [
    { key: 'name', label: 'Họ tên', type: 'text', span: 12, required: true, maxLength: 100 },
    { key: 'email', label: 'Email', type: 'email', span: 12, required: true },
    { key: 'phone', label: 'Số điện thoại', type: 'text', span: 12, maxLength: 20 },
    {
      key: 'department',
      label: 'Phòng ban',
      type: 'select',
      span: 12,
      options: DEPARTMENT_OPTIONS,
    },
    { key: 'address', label: 'Địa chỉ', type: 'textarea', span: 24, maxLength: 255 },
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select',
      span: 12,
      required: true,
      options: ROLE_OPTIONS,
      defaultValue: 'viewer',
    },
    {
      key: 'active',
      label: 'Hoạt động',
      type: 'switch',
      span: 12,
      defaultValue: true,
      switchLabels: ['Hoạt động', 'Đã khóa'],
    },
  ];
}
