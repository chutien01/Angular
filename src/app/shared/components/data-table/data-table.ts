import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  BadgeStatus,
  ColumnAlign,
  ColumnType,
  TableAction,
  TableColumn,
  TableFilter,
  TablePrimaryAction,
} from './data-table.types';

interface Cell {
  type: ColumnType;
  text: string;
  align: ColumnAlign;
  sub?: string;
  initials?: string;
  color?: string;
  status?: { status: BadgeStatus; text: string };
}

interface RowView<T> {
  row: T;
  key: unknown;
  /** Giá trị cột đầu tiên, dùng làm nhãn cho các nút thao tác. */
  label: string;
  cells: Cell[];
}

const POPOVER_CHROME = 160; // tiêu đề + footer + lề của popover
const POPOVER_MIN_BODY = 96;

const numberFormat = new Intl.NumberFormat('en-US');

const valueOf = (row: object, key: string): unknown => (row as Record<string, unknown>)[key];

const isFilled = (value: unknown): boolean => value !== null && value !== undefined && value !== '';

const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)).toUpperCase();
};

@Component({
  selector: 'app-data-table',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    NzAvatarModule,
    NzBadgeModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
  ],
  templateUrl: './data-table.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class DataTable<T extends object> {
  readonly data = input.required<T[]>();
  readonly columns = input.required<TableColumn<T>[]>();
  readonly filters = input<TableFilter<T>[]>([]);
  readonly actions = input<TableAction<T>[]>([]);
  readonly primaryAction = input<TablePrimaryAction>();
  readonly loading = input(false);
  readonly pageSize = input(8);
  readonly rowKey = input<keyof T & string>('id' as keyof T & string);

  /** Giá trị đang nhập ở các ô lọc, chỉ có hiệu lực khi bấm tìm kiếm. */
  protected readonly draft = signal<Record<string, unknown>>({});
  protected readonly applied = signal<Record<string, unknown>>({});
  /** Bản nháp riêng của popover tìm kiếm nâng cao, bỏ đi nếu bấm Hủy. */
  protected readonly advancedDraft = signal<Record<string, unknown>>({});
  protected readonly advancedOpen = signal(false);
  /** Chiều cao tối đa của vùng field trong popover, tính theo khoảng trống bên dưới nút để footer luôn hiển thị. */
  protected readonly advancedBodyMaxHeight = signal(320);
  private readonly advancedTrigger = viewChild('advancedTrigger', { read: ElementRef<HTMLElement> });
  private readonly document = inject(DOCUMENT);

  protected readonly basicFilters = computed(() => this.filters().filter((filter) => !filter.advanced));
  protected readonly advancedFilters = computed(() => this.filters().filter((filter) => filter.advanced));
  /** Số điều kiện nâng cao đang được áp dụng, hiện trên nút tìm kiếm nâng cao. */
  protected readonly advancedActiveCount = computed(
    () => this.advancedFilters().filter((filter) => isFilled(this.applied()[filter.key])).length,
  );

  protected readonly headers = computed(() =>
    this.columns().map((column) => ({
      key: column.key,
      title: column.title,
      width: column.width ?? null,
      align: column.align ?? (column.type === 'number' ? 'right' : 'left'),
    })),
  );

  private readonly filteredData = computed(() => {
    const applied = this.applied();
    const active = this.filters().filter((filter) => isFilled(applied[filter.key]));
    return this.data().filter((row) => active.every((filter) => this.matches(filter, row, applied[filter.key])));
  });

  protected readonly rows = computed<RowView<T>[]>(() => {
    const columns = this.columns();
    const rowKey = this.rowKey();
    return this.filteredData().map((row) => {
      const cells = columns.map((column) => this.buildCell(row, column));
      return { row, key: valueOf(row, rowKey), label: cells[0]?.text ?? '', cells };
    });
  });

  protected setValue(scope: 'bar' | 'modal', key: string, value: unknown): void {
    const target = scope === 'bar' ? this.draft : this.advancedDraft;
    target.update((values) => ({ ...values, [key]: value }));
  }

  protected search(): void {
    this.applied.set({ ...this.draft() });
  }

  protected reset(): void {
    this.draft.set({});
    this.advancedDraft.set({});
    this.applied.set({});
  }

  protected onAdvancedVisibleChange(visible: boolean): void {
    if (visible) {
      this.advancedDraft.set({ ...this.draft() });
      this.fitAdvancedBody();
    }
    this.advancedOpen.set(visible);
  }

  private fitAdvancedBody(): void {
    const trigger = this.advancedTrigger()?.nativeElement;
    const viewportHeight = this.document.defaultView?.innerHeight;
    if (!trigger || !viewportHeight) {
      return;
    }
    const available = viewportHeight - trigger.getBoundingClientRect().bottom - POPOVER_CHROME;
    this.advancedBodyMaxHeight.set(Math.max(POPOVER_MIN_BODY, available));
  }

  protected cancelAdvanced(): void {
    this.advancedOpen.set(false);
  }

  protected searchAdvanced(): void {
    const merged = { ...this.draft() };
    for (const filter of this.advancedFilters()) {
      merged[filter.key] = this.advancedDraft()[filter.key];
    }
    this.draft.set(merged);
    this.applied.set({ ...merged });
    this.advancedOpen.set(false);
  }

  private matches(filter: TableFilter<T>, row: T, value: unknown): boolean {
    if (filter.match) {
      return filter.match(row, value);
    }
    if (filter.type === 'text') {
      const keyword = String(value).trim().toLowerCase();
      const keys = filter.searchKeys ?? [filter.key];
      return keys.some((key) => String(valueOf(row, key) ?? '').toLowerCase().includes(keyword));
    }
    return valueOf(row, filter.key) === value;
  }

  private buildCell(row: T, column: TableColumn<T>): Cell {
    const raw = valueOf(row, column.key);
    const type = column.type ?? 'text';
    const align = column.align ?? (type === 'number' ? 'right' : 'left');
    switch (type) {
      case 'number':
        return { type, align, text: numberFormat.format(Number(raw)) };
      case 'tag':
        return {
          type,
          align,
          text: column.tagText?.(row) ?? String(raw),
          color: column.tagColor?.(row),
        };
      case 'status':
        return { type, align, text: String(raw), status: column.statuses?.[String(raw)] };
      default: {
        const text = String(raw ?? '');
        return {
          type,
          align,
          text,
          sub: column.sub?.(row),
          initials: column.avatar ? initialsOf(text) : undefined,
        };
      }
    }
  }
}
