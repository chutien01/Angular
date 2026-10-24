import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CrudFieldDef } from '../../shared/components/crud-form/crud-field-def';
import { FormField } from '../../shared/components/crud-form/crud-form.types';
import { CrudPage } from '../../shared/components/crud-page/crud-page';
import { PageAction } from '../../shared/components/crud-page/crud-page.types';
import { TableColumn, TableFilter } from '../../shared/components/data-table/data-table.types';

const LOW_STOCK = 10;
const CATEGORY_SUGGESTIONS = ['Phụ kiện', 'Màn hình', 'Laptop', 'Âm thanh'];

@Component({
  selector: 'app-product-list',
  imports: [ReactiveFormsModule, NzAutocompleteModule, NzInputModule, CrudFieldDef, CrudPage],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  protected readonly service = inject(ProductService);

  /** Nút bên phải tiêu đề trang; thêm nút mới chỉ cần thêm phần tử vào mảng này. */
  protected readonly pageActions: PageAction<Product>[] = [
    { label: 'Thêm sản phẩm', icon: 'plus', type: 'primary', handler: (page) => page.create() },
  ];

  protected readonly columns: TableColumn<Product>[] = [
    { key: 'name', title: 'Sản phẩm', width: '240px', sub: (product) => `Mã #${product.id}` },
    { key: 'sku', title: 'Mã SKU', width: '140px' },
    { key: 'brand', title: 'Thương hiệu', width: '140px' },
    { key: 'category', title: 'Danh mục', width: '150px', type: 'tag', tagColor: () => 'default' },
    { key: 'supplier', title: 'Nhà cung cấp', width: '260px' },
    { key: 'warehouse', title: 'Kho', width: '180px' },
    { key: 'price', title: 'Giá (VNĐ)', width: '140px', type: 'number' },
    {
      key: 'stock',
      title: 'Tồn kho',
      width: '140px',
      type: 'tag',
      align: 'right',
      tagColor: (product) => (product.stock < LOW_STOCK ? 'red' : undefined),
      tagText: (product) =>
        product.stock < LOW_STOCK ? `${product.stock} · Sắp hết` : String(product.stock),
    },
  ];

  protected readonly filters: TableFilter<Product>[] = [
    { key: 'keyword', label: 'Tìm theo tên sản phẩm', type: 'text', searchKeys: ['name'] },
    {
      key: 'category',
      label: 'Danh mục',
      type: 'select',
      options: (products) =>
        [...new Set(products.map((product) => product.category))].map((category) => ({
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
      match: (product, value) =>
        value === 'low' ? product.stock < LOW_STOCK : product.stock >= LOW_STOCK,
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
  ];

  /** Thứ tự trong mảng = vị trí hiển thị; span tính trên lưới 24 cột (24 = cả hàng, 12 = nửa hàng). */
  protected readonly fields: FormField<Product>[] = [
    { key: 'name', label: 'Tên sản phẩm', type: 'text', span: 16, required: true, maxLength: 150 },
    { key: 'sku', label: 'Mã SKU', type: 'text', span: 8, required: true, maxLength: 30 },
    { key: 'brand', label: 'Thương hiệu', type: 'text', span: 12 },
    // Field custom: giao diện khai báo bằng <ng-template appCrudField="category"> trong product-list.html
    { key: 'category', label: 'Danh mục', type: 'custom', span: 12, required: true },
    {
      key: 'price',
      label: 'Giá (VNĐ)',
      type: 'number',
      span: 6,
      required: true,
      min: 0,
      step: 1000,
      defaultValue: 0,
    },
    {
      key: 'stock',
      label: 'Tồn kho',
      type: 'number',
      span: 6,
      required: true,
      min: 0,
      defaultValue: 0,
    },
    { key: 'supplier', label: 'Nhà cung cấp', type: 'text', span: 12 },
    {
      key: 'warehouse',
      label: 'Kho',
      type: 'select',
      span: 12,
      options: ['Kho Hà Nội', 'Kho Đà Nẵng', 'Kho TP. Hồ Chí Minh'].map((warehouse) => ({
        label: warehouse,
        value: warehouse,
      })),
    },
  ];

  /** Gợi ý cho field custom "category", lọc theo nội dung đang gõ. */
  protected categorySuggestions(value: unknown): string[] {
    const keyword = String(value ?? '')
      .trim()
      .toLowerCase();
    return CATEGORY_SUGGESTIONS.filter((category) => category.toLowerCase().includes(keyword));
  }
}
