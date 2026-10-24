import { Component, computed, contentChildren, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom } from 'rxjs';
import { CrudService } from '../../../core/models/crud-service.model';
import { CrudFieldDef } from '../crud-form/crud-field-def';
import { CrudForm } from '../crud-form/crud-form';
import { CrudFormAction, CrudFormMode, FormField } from '../crud-form/crud-form.types';
import { DataTable } from '../data-table/data-table';
import { TableAction, TableColumn, TableFilter } from '../data-table/data-table.types';
import { PageHeader } from '../page-header/page-header';
import { CrudPageApi, PageAction } from './crud-page.types';

const ACTION_LABELS: Record<CrudFormAction, string> = {
  create: 'Thêm mới',
  edit: 'Cập nhật',
  view: 'Chi tiết',
};

interface FormState<T> {
  action: CrudFormAction;
  row: T | null;
}

/**
 * Trang danh sách có đủ CRUD: card chứa breadcrumb + tiêu đề, bảng có bộ lọc,
 * form thêm/sửa/xem (modal hoặc inline) và modal xác nhận xóa.
 * Trang sử dụng chỉ cần khai báo `columns`, `filters`, `fields`, `pageActions` và truyền service.
 */
@Component({
  selector: 'app-crud-page',
  imports: [NzButtonModule, NzIconModule, CrudForm, DataTable, PageHeader],
  templateUrl: './crud-page.html',
  styleUrl: './crud-page.scss',
})
export class CrudPage<T extends { id: number }, P = Omit<T, 'id'>> {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  /** Tên đối tượng viết thường, ví dụ "người dùng". */
  readonly entityName = input.required<string>();
  readonly service = input.required<CrudService<T, P>>();
  readonly columns = input.required<TableColumn<T>[]>();
  readonly filters = input<TableFilter<T>[]>([]);
  readonly fields = input.required<FormField<T>[]>();
  readonly formMode = input<CrudFormMode>('modal_form');
  readonly viewReadonly = input(true);
  /** Các nút bên phải tiêu đề trang (Thêm mới, Xuất file, ...). */
  readonly pageActions = input<PageAction<T>[]>([]);

  /** Các `<ng-template appCrudField="key">` khai báo trong trang, chuyển tiếp cho crud-form. */
  private readonly fieldDefs = contentChildren(CrudFieldDef);
  protected readonly fieldTemplates = computed(() =>
    Object.fromEntries(this.fieldDefs().map((def) => [def.key(), def.template])),
  );

  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  private readonly records = rxResource({
    params: () => this.service(),
    stream: ({ params: service }) => service.getAll(),
    defaultValue: [] as T[],
  });
  protected readonly data = this.records.value;
  protected readonly loading = this.records.isLoading;

  protected readonly formState = signal<FormState<T> | null>(null);
  protected readonly saving = signal(false);

  protected readonly inlineFormOpen = computed(() => this.formMode() === 'inline_form' && this.formState() !== null);
  protected readonly breadcrumbCurrent = computed(() => {
    const state = this.formState();
    return this.inlineFormOpen() && state ? ACTION_LABELS[state.action] : undefined;
  });

  protected readonly actions: TableAction<T>[] = [
    { icon: 'eye', tooltip: 'Xem chi tiết', handler: (row) => this.open('view', row) },
    { icon: 'edit', tooltip: 'Sửa', handler: (row) => this.open('edit', row) },
    { icon: 'delete', tooltip: 'Xóa', danger: true, handler: (row) => this.confirmDelete(row) },
  ];

  /** Những gì nút trên đầu trang được phép gọi. */
  private readonly api: CrudPageApi<T> = {
    create: () => this.open('create', null),
    reload: () => this.records.reload(),
    data: () => this.data(),
  };

  protected runPageAction(action: PageAction<T>): void {
    action.handler(this.api);
  }

  protected close(): void {
    this.formState.set(null);
  }

  protected save(values: Record<string, unknown>): void {
    const state = this.formState();
    if (!state || state.action === 'view') {
      return;
    }
    const payload = values as P;
    const isEdit = state.action === 'edit' && state.row !== null;
    const request = isEdit ? this.service().update(state.row!.id, payload) : this.service().create(payload);
    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.message.success(isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công');
        this.saving.set(false);
        this.close();
        this.records.reload();
      },
      error: () => {
        this.message.error('Có lỗi xảy ra, vui lòng thử lại');
        this.saving.set(false);
      },
    });
  }

  private open(action: CrudFormAction, row: T | null): void {
    this.formState.set({ action, row });
  }

  private confirmDelete(row: T): void {
    const firstColumn = this.columns()[0];
    const label = firstColumn ? String((row as Record<string, unknown>)[firstColumn.key] ?? '') : '';
    this.modal.confirm({
      nzTitle: `Xóa ${this.entityName()}?`,
      nzContent: `"${label}" sẽ bị xóa và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?`,
      nzIconType: 'exclamation-circle',
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () =>
        firstValueFrom(this.service().delete(row.id))
          .then(() => {
            this.message.success('Đã xóa');
            this.records.reload();
          })
          .catch(() => this.message.error('Xóa thất bại')),
    });
  }
}
