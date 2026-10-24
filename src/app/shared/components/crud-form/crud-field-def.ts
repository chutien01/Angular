import { Directive, TemplateRef, inject, input } from '@angular/core';
import { CrudFieldContext } from './crud-form.types';

/**
 * Khai báo giao diện cho một field `type: 'custom'` của crud-form.
 *
 * ```html
 * <app-crud-page ...>
 *   <ng-template appCrudField="category" let-control let-id="id">
 *     <input nz-input [id]="id" [formControl]="control" />
 *   </ng-template>
 * </app-crud-page>
 * ```
 * Nhãn, dấu bắt buộc và thông báo lỗi vẫn do crud-form hiển thị theo cấu hình của field.
 */
@Directive({ selector: 'ng-template[appCrudField]' })
export class CrudFieldDef {
  /** Trùng với `key` của field trong mảng `fields`. */
  readonly key = input.required<string>({ alias: 'appCrudField' });
  readonly template = inject<TemplateRef<CrudFieldContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CrudFieldDef, context: unknown): context is CrudFieldContext {
    return true;
  }
}
