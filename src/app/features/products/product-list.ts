import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Product, ProductPayload } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { DataTable } from '../../shared/components/data-table/data-table';
import {
  TableAction,
  TableColumn,
  TableFilter,
  TablePrimaryAction,
} from '../../shared/components/data-table/data-table.types';
import { PageHeader } from '../../shared/components/page-header';

const LOW_STOCK = 10;

@Component({
  selector: 'app-product-list',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    DataTable,
    PageHeader,
  ],
  templateUrl: './product-list.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly message = inject(NzMessageService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly columns: TableColumn<Product>[] = [
    { key: 'name', title: 'Sản phẩm', sub: (product) => `Mã #${product.id}` },
    { key: 'category', title: 'Danh mục', type: 'tag', tagColor: () => 'default' },
    { key: 'price', title: 'Giá (VNĐ)', type: 'number' },
    {
      key: 'stock',
      title: 'Tồn kho',
      type: 'tag',
      align: 'right',
      tagColor: (product) => (product.stock < LOW_STOCK ? 'red' : undefined),
      tagText: (product) => (product.stock < LOW_STOCK ? `${product.stock} · Sắp hết` : String(product.stock)),
    },
  ];

  private readonly productsResource = rxResource({
    stream: () => this.productService.getAll(),
    defaultValue: [] as Product[],
  });
  protected readonly products = this.productsResource.value;
  protected readonly loading = this.productsResource.isLoading;

  protected readonly filters = computed<TableFilter<Product>[]>(() => [
    { key: 'keyword', label: 'Tìm theo tên sản phẩm', type: 'text', searchKeys: ['name'] },
    {
      key: 'category',
      label: 'Danh mục',
      type: 'select',
      options: [...new Set(this.products().map((product) => product.category))].map((category) => ({
        label: category,
        value: category,
      })),
    },
    {
      key: 'stockStatus',
      label: 'Tình trạng kho',
      type: 'select',
      advanced: true,
      options: [
        { label: 'Sắp hết hàng', value: 'low' },
        { label: 'Còn hàng', value: 'ok' },
      ],
      match: (product, value) => (value === 'low' ? product.stock < LOW_STOCK : product.stock >= LOW_STOCK),
    },
    {
      key: 'minPrice',
      label: 'Giá từ (VNĐ)',
      type: 'number',
      advanced: true,
      match: (product, value) => product.price >= Number(value),
    },
    {
      key: 'maxPrice',
      label: 'Giá đến (VNĐ)',
      type: 'number',
      advanced: true,
      match: (product, value) => product.price <= Number(value),
    },
  ]);

  protected readonly actions: TableAction<Product>[] = [
    { icon: 'edit', tooltip: 'Sửa', handler: (product) => this.openEdit(product) },
    {
      icon: 'delete',
      tooltip: 'Xóa',
      danger: true,
      confirm: 'Xóa sản phẩm này?',
      handler: (product) => this.remove(product),
    },
  ];

  protected readonly primaryAction: TablePrimaryAction = {
    label: 'Thêm sản phẩm',
    icon: 'plus',
    handler: () => this.openCreate(),
  };

  protected readonly saving = signal(false);
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  private openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.modalOpen.set(true);
  }

  private openEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.reset(product);
    this.modalOpen.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((c) => c.updateValueAndValidity());
      return;
    }
    const payload: ProductPayload = this.form.getRawValue();
    const id = this.editingId();
    this.saving.set(true);
    (id ? this.productService.update(id, payload) : this.productService.create(payload)).subscribe({
      next: () => {
        this.message.success(id ? 'Cập nhật thành công' : 'Thêm mới thành công');
        this.saving.set(false);
        this.modalOpen.set(false);
        this.productsResource.reload();
      },
      error: () => {
        this.message.error('Có lỗi xảy ra, vui lòng thử lại');
        this.saving.set(false);
      },
    });
  }

  private remove(product: Product): void {
    this.productService.delete(product.id).subscribe({
      next: () => {
        this.message.success('Đã xóa');
        this.productsResource.reload();
      },
      error: () => this.message.error('Xóa thất bại'),
    });
  }
}
