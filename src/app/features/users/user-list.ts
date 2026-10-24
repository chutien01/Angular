import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { User, UserPayload, UserRole } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { DataTable } from '../../shared/components/data-table/data-table';
import {
  TableAction,
  TableColumn,
  TableFilter,
  TablePrimaryAction,
} from '../../shared/components/data-table/data-table.types';
import { PageHeader } from '../../shared/components/page-header';

const ROLES: UserRole[] = ['admin', 'editor', 'viewer'];
const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'geekblue',
  editor: 'purple',
  viewer: 'default',
};

@Component({
  selector: 'app-user-list',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    DataTable,
    PageHeader,
  ],
  templateUrl: './user-list.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class UserList {
  private readonly userService = inject(UserService);
  private readonly message = inject(NzMessageService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly roles = ROLES;

  protected readonly columns: TableColumn<User>[] = [
    { key: 'name', title: 'Người dùng', avatar: true, sub: (user) => user.email },
    { key: 'role', title: 'Vai trò', type: 'tag', tagColor: (user) => ROLE_COLORS[user.role] },
    {
      key: 'active',
      title: 'Trạng thái',
      type: 'status',
      statuses: {
        true: { status: 'success', text: 'Hoạt động' },
        false: { status: 'error', text: 'Đã khóa' },
      },
    },
  ];

  protected readonly filters: TableFilter<User>[] = [
    { key: 'keyword', label: 'Tìm theo tên hoặc email', type: 'text', searchKeys: ['name', 'email'] },
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select',
      options: ROLES.map((role) => ({ label: role, value: role })),
    },
    {
      key: 'active',
      label: 'Trạng thái',
      type: 'select',
      advanced: true,
      options: [
        { label: 'Hoạt động', value: true },
        { label: 'Đã khóa', value: false },
      ],
    },
    { key: 'email', label: 'Email chứa', type: 'text', advanced: true },
  ];

  protected readonly actions: TableAction<User>[] = [
    { icon: 'edit', tooltip: 'Sửa', handler: (user) => this.openEdit(user) },
    {
      icon: 'delete',
      tooltip: 'Xóa',
      danger: true,
      confirm: 'Xóa người dùng này?',
      handler: (user) => this.remove(user),
    },
  ];

  protected readonly primaryAction: TablePrimaryAction = {
    label: 'Thêm người dùng',
    icon: 'plus',
    handler: () => this.openCreate(),
  };

  private readonly usersResource = rxResource({
    stream: () => this.userService.getAll(),
    defaultValue: [] as User[],
  });
  protected readonly users = this.usersResource.value;
  protected readonly loading = this.usersResource.isLoading;

  protected readonly saving = signal(false);
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['viewer' as UserRole, Validators.required],
    active: [true],
  });

  private openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.modalOpen.set(true);
  }

  private openEdit(user: User): void {
    this.editingId.set(user.id);
    this.form.reset(user);
    this.modalOpen.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((c) => c.updateValueAndValidity());
      return;
    }
    const payload: UserPayload = this.form.getRawValue();
    const id = this.editingId();
    this.saving.set(true);
    (id ? this.userService.update(id, payload) : this.userService.create(payload)).subscribe({
      next: () => {
        this.message.success(id ? 'Cập nhật thành công' : 'Thêm mới thành công');
        this.saving.set(false);
        this.modalOpen.set(false);
        this.usersResource.reload();
      },
      error: () => {
        this.message.error('Có lỗi xảy ra, vui lòng thử lại');
        this.saving.set(false);
      },
    });
  }

  private remove(user: User): void {
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.message.success('Đã xóa');
        this.usersResource.reload();
      },
      error: () => this.message.error('Xóa thất bại'),
    });
  }
}
