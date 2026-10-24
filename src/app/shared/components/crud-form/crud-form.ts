import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  computed,
  effect,
  input,
  linkedSignal,
  output,
  untracked,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { CrudFieldContext, CrudFormAction, CrudFormMode, FormField } from './crud-form.types';

const numberFormat = new Intl.NumberFormat('en-US');
const GRID_COLUMNS = 24;
const DEFAULT_SPAN = 12;

/** Số cột (1–24) mà field chiếm trên lưới. */
const spanOf = <T>(field: FormField<T>): number =>
  Math.min(GRID_COLUMNS, Math.max(1, Math.round(field.span ?? DEFAULT_SPAN)));

const valueOf = (row: object, key: string): unknown => (row as Record<string, unknown>)[key];

const defaultOf = <T>(field: FormField<T>): unknown =>
  field.defaultValue ?? (field.type === 'switch' ? false : field.type === 'number' ? null : '');

const validatorsOf = <T>(field: FormField<T>): ValidatorFn[] => {
  const validators: ValidatorFn[] = [];
  if (field.required) validators.push(Validators.required);
  if (field.type === 'email') validators.push(Validators.email);
  if (field.min !== undefined) validators.push(Validators.min(field.min));
  if (field.max !== undefined) validators.push(Validators.max(field.max));
  if (field.maxLength !== undefined) validators.push(Validators.maxLength(field.maxLength));
  return validators;
};

/**
 * Form thêm mới / cập nhật / xem chi tiết sinh từ danh sách `fields`.
 * - `modal_form`: hiển thị trong modal, mở khi `action` khác null.
 * - `inline_form`: hiển thị ngay trong trang; chỉ vùng field cuộn, tiêu đề và nút thao tác cố định.
 */
@Component({
  selector: 'app-crud-form',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
  ],
  templateUrl: './crud-form.html',
  styleUrl: './crud-form.scss',
  host: { '[class.inline-form]': "mode() === 'inline_form'" },
})
export class CrudForm<T extends object> {
  readonly fields = input.required<FormField<T>[]>();
  readonly mode = input<CrudFormMode>('modal_form');
  /** `null` nghĩa là form đang đóng. */
  readonly action = input<CrudFormAction | null>(null);
  /** Dữ liệu của bản ghi khi cập nhật / xem chi tiết. */
  readonly value = input<T | null>(null);
  /** Tên đối tượng dùng trong tiêu đề, ví dụ "người dùng". */
  readonly entityName = input.required<string>();
  readonly saving = input(false);
  /** Xem chi tiết hiển thị dạng chỉ đọc (văn bản); `false` thì hiển thị các ô nhập bị vô hiệu hóa. */
  readonly viewReadonly = input(true);
  /** Template của các field `custom`, theo `key` (crud-page tự gom từ các `<ng-template appCrudField>`). */
  readonly fieldTemplates = input<Record<string, TemplateRef<CrudFieldContext>>>({});

  readonly save = output<Record<string, unknown>>();
  readonly closed = output<void>();

  // Giới hạn hữu hạn thay cho ±Infinity mặc định, vì aria-valuemin/max không chấp nhận Infinity.
  protected readonly numberMin = Number.MIN_SAFE_INTEGER;
  protected readonly numberMax = Number.MAX_SAFE_INTEGER;

  protected readonly form = computed(
    () =>
      new FormGroup<Record<string, FormControl<unknown>>>(
        Object.fromEntries(
          this.fields().map((field) => [
            field.key,
            new FormControl<unknown>(defaultOf(field), validatorsOf(field)),
          ]),
        ),
      ),
  );

  /**
   * Thao tác + bản ghi đang hiển thị. Khi form đóng (`action` về null) vẫn giữ giá trị cuối cùng,
   * để tiêu đề / nội dung / footer của modal không đổi trong lúc chạy hiệu ứng đóng.
   */
  private readonly shown = linkedSignal<
    { action: CrudFormAction | null; row: T | null },
    { action: CrudFormAction | null; row: T | null }
  >({
    source: () => ({ action: this.action(), row: this.value() }),
    computation: (current, previous) => (current.action || !previous ? current : previous.value),
  });

  protected readonly isView = computed(() => this.shown().action === 'view');
  protected readonly showReadonly = computed(() => this.isView() && this.viewReadonly());

  protected readonly title = computed(() => {
    const entity = this.entityName();
    switch (this.shown().action) {
      case 'edit':
        return `Cập nhật ${entity}`;
      case 'view':
        return `Chi tiết ${entity}`;
      default:
        return `Thêm mới ${entity}`;
    }
  });
  protected readonly submitText = computed(() =>
    this.shown().action === 'edit' ? 'Cập nhật' : 'Thêm mới',
  );

  protected readonly readonlyItems = computed(() => {
    const row = this.shown().row;
    return this.fields().map((field) => ({
      key: field.key,
      label: field.label,
      span: spanOf(field),
      text: this.displayText(field, row ? valueOf(row, field.key) : undefined),
    }));
  });

  constructor() {
    // Nạp lại dữ liệu mỗi khi mở form với một thao tác / bản ghi mới.
    effect(() => {
      const action = this.action();
      const row = this.value();
      const form = this.form();
      const disabled = action === 'view' && !this.viewReadonly();
      if (!action) {
        return;
      }
      untracked(() => {
        form.reset(
          Object.fromEntries(
            this.fields().map((field) => [
              field.key,
              row ? valueOf(row, field.key) : defaultOf(field),
            ]),
          ),
        );
        if (disabled) {
          form.disable();
        } else {
          form.enable();
        }
      });
    });
  }

  protected spanOf(field: FormField<T>): number {
    return spanOf(field);
  }

  protected controlOf(field: FormField<T>): FormControl<unknown> {
    return this.form().controls[field.key];
  }

  protected contextOf(field: FormField<T>): CrudFieldContext {
    const control = this.controlOf(field);
    return { $implicit: control, control, id: this.idOf(field), field: field as FormField<object> };
  }

  protected idOf(field: FormField<T>): string {
    return `crud-${field.key}`;
  }

  protected errorText(field: FormField<T>, control: AbstractControl): string {
    const errors = control.errors ?? {};
    if (errors['required']) {
      return field.type === 'select'
        ? `Vui lòng chọn ${field.label}`
        : `Vui lòng nhập ${field.label}`;
    }
    if (errors['email']) return 'Email không hợp lệ';
    if (errors['min'])
      return `${field.label} phải lớn hơn hoặc bằng ${numberFormat.format(field.min ?? 0)}`;
    if (errors['max'])
      return `${field.label} phải nhỏ hơn hoặc bằng ${numberFormat.format(field.max ?? 0)}`;
    if (errors['maxlength']) return `${field.label} tối đa ${field.maxLength} ký tự`;
    return `${field.label} không hợp lệ`;
  }

  protected submit(): void {
    const form = this.form();
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => {
        control.markAsDirty();
        control.markAsTouched();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.save.emit(form.getRawValue());
  }

  private displayText(field: FormField<T>, value: unknown): string {
    if (field.display) {
      return field.display(value);
    }
    if (field.type === 'switch') {
      const [on, off] = field.switchLabels ?? ['Có', 'Không'];
      return value ? on : off;
    }
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (field.type === 'select') {
      return field.options?.find((option) => option.value === value)?.label ?? String(value);
    }
    if (field.type === 'number') {
      return numberFormat.format(Number(value));
    }
    return String(value);
  }
}
