# RULE.md — Quy tắc làm việc cho mọi agent trong dự án Angular_Base

Đọc toàn bộ file này **trước khi sửa code**. Đây là nguồn quy tắc chung cho mọi agent (Claude, Copilot, Cursor, Codex, Gemini...).
`CLAUDE.md` chứa best practice Angular chung; nếu hai file mâu thuẫn thì **RULE.md thắng**.

---

## 1. Tổng quan dự án

Trang quản trị (admin) CRUD dữ liệu, giao diện tiếng Việt.

| Thành phần | Phiên bản / ghi chú |
|---|---|
| Angular | 22, standalone, **zoneless** (`provideZonelessChangeDetection`), OnPush mặc định, không SSR |
| UI library | ng-zorro-antd 22 (Ant Design v4) — CSS gốc `ng-zorro-antd.variable.min.css` |
| CSS | Tailwind CSS v4 (PostCSS) + SCSS cho design token / theme / style component |
| Test | Vitest (`ng test`) |
| Dữ liệu | Mock API bằng HTTP interceptor (chưa có backend thật) |
| Theme | light (mặc định) / dark, đổi lúc runtime bằng `ThemeService` |

Lệnh:

```bash
npm start                    # ng serve — PHẢI chạy lại sau khi sửa angular.json
npx ng build                 # build production (kiểm tra kiểu + template)
npx ng test --watch=false    # chạy test một lần
```

Không có lệnh lint riêng. Không thêm thư viện mới nếu chưa được người dùng đồng ý.

---

## 2. Cấu trúc thư mục

```
src/
├── index.html                      # có script đặt data-theme trước khi vẽ trang (chống chớp)
├── styles.css                      # ENTRY TAILWIND + CSS gốc ng-zorro (@layer antd) + utility ngữ nghĩa
├── styles/                         # ENTRY SCSS: design token, theme, map token → component
│   ├── styles.scss                 # @use theo thứ tự: tokens → themes → vendors → base → components
│   ├── abstracts/_tokens.scss      # token không phụ thuộc theme + token component
│   ├── abstracts/_mixins.scss      # ng-zorro-override, focus-ring
│   ├── themes/_light-theme.scss    # CHỈ giá trị token cho light
│   ├── themes/_dark-theme.scss     # CHỈ giá trị token cho dark (cùng tên token)
│   ├── vendors/_ng-zorro.scss      # gán --ant-* (API biến CSS chính thức) = token
│   ├── base/_typography.scss
│   └── components/_<tên>.scss      # map token vào từng component ng-zorro / bố cục app
└── app/
    ├── app.config.ts               # providers: router, http + mock interceptor, i18n, ICON, theme init
    ├── app.routes.ts               # route lazy (loadComponent) bên trong AdminLayout
    ├── core/                       # singleton, KHÔNG có giao diện
    │   ├── models/                 # interface dữ liệu (*.model.ts), CrudService<T, P>
    │   ├── services/               # *.service.ts (gọi HttpClient), theme.service.ts
    │   └── interceptors/           # mock-api.interceptor.ts
    ├── mock_data/mock_data.ts      # dữ liệu mock + MOCK_DB (key = đường dẫn /api/<key>)
    ├── layout/                     # khung trang: header, sidebar (menu), footer
    ├── shared/components/          # component UI dùng lại nhiều nơi, mỗi cái 1 thư mục
    │   ├── crud-page/              # trang CRUD hoàn chỉnh (card + bảng + form + xóa)
    │   ├── crud-form/              # form thêm/sửa/xem (modal_form | inline_form) + directive appCrudField
    │   ├── data-table/             # bảng: bộ lọc, lọc nâng cao, STT, cột cố định, thao tác
    │   └── page-header/            # breadcrumb + tiêu đề + slot nút thao tác
    └── features/<tên>/             # từng màn hình nghiệp vụ (users, products, ...)
```

Quy tắc đặt chỗ:
- Dùng ở **≥ 2 màn hình** → `shared/components/<tên>/`. Chỉ một màn hình dùng → để cạnh màn hình đó trong `features/<tên>/`.
- Service, model, interceptor, guard (không giao diện) → `core/`.
- Pipe / directive dùng chung → `shared/pipes/`, `shared/directives/` (tạo khi cần).

---

## 3. Quy tắc bắt buộc

### 3.1 Component
- Mỗi component có **file `.ts` + `.html` riêng**. **Cấm** `template:` inline, kể cả component nhỏ.
- Chỉ thêm `.scss` (qua `styleUrl`) khi component có style riêng. **Cấm** `styles:` inline.
- Style của chính thẻ component viết bằng `:host { ... }` trong `.scss`. **Cấm** `host: { class: '...' }` chứa class Tailwind trong `.ts`. Host binding chỉ dùng cho cờ trạng thái, ví dụ `'[class.inline-form]': "mode() === 'inline_form'"` (style vẫn nằm trong `.scss`).
- Component có nhiều file → đặt trong thư mục riêng cùng tên.
- `ng generate component` đã cấu hình sẵn sinh `.ts/.html/.scss` — xóa `.scss` rỗng nếu không dùng.
- Không đặt `standalone: true`, không đặt `changeDetection` (OnPush là mặc định ở v22).
- Dùng `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `inject()`; không dùng decorator `@Input/@Output/@HostBinding/@HostListener`.
- Control flow mới: `@if`, `@for` (luôn có `track`), `@switch`. Không `ngClass/ngStyle/CommonModule`.

### 3.2 Trạng thái & dữ liệu (zoneless)
- App chạy **không có Zone.js**: mọi trạng thái mà template đọc phải là **signal** (hoặc `computed`, `rxResource`, `async` pipe). Không dùng `NgZone`, không gán thuộc tính thường rồi mong giao diện tự cập nhật.
- Tải danh sách bằng `rxResource({ params, stream })`; sau thêm/sửa/xóa gọi `.reload()`.
- Service singleton dùng `@Service()` (Angular 22), gọi API bằng `HttpClient`.

### 3.3 Form
- Form **đơn giản** (vài field, validate cơ bản — đăng nhập, đổi mật khẩu, hồ sơ) → **Signal Forms** (`@angular/forms/signals`).
- Form **phức tạp / nhiều logic** (field phụ thuộc nhau, validate chéo, sinh field động) → **Reactive Forms**. `app-crud-form` thuộc nhóm này.
- Không dùng Template-driven forms cho nhập liệu (ngoại lệ đã có: ô lọc của `data-table` bind bằng `ngModel`).

### 3.4 Giao diện, màu sắc, kích thước
- **Không bao giờ hardcode màu / kích thước** trong template hay `.scss` của component. Dùng token (xem mục 6).
- Trong template dùng utility ngữ nghĩa: `bg-page`, `bg-surface`, `bg-elevated`, `bg-subtle`, `border-line`, `text-fg`, `text-fg-muted`, `text-brand`, `bg-brand-solid`, `text-on-brand`, `text-danger`. Cấm `bg-white`, `text-slate-*`, `#xxxxxx`...
- Trong `.scss` dùng `var(--token)`.
- Mọi icon dùng trong template phải được **đăng ký** trong `provideNzIcons([...])` ở `app.config.ts` (import từ `@ant-design/icons-angular/icons`), nếu không icon sẽ không hiện.
- Nút chỉ có icon phải có `nz-tooltip` + `aria-label`.

### 3.5 Accessibility (bắt buộc)
- Đạt **axe** + **WCAG AA** ở **cả light và dark**: tương phản chữ ≥ 4.5:1, focus bàn phím nhìn thấy được, mọi control có nhãn (`label for` / `aria-label`), nút icon có `aria-label`.

### 3.6 Ngôn ngữ
- Nội dung giao diện, thông báo, comment trong code: **tiếng Việt có dấu**. Tên biến/hàm/file: tiếng Anh.

---

## 4. Công thức: thêm một màn hình CRUD mới

Ví dụ thêm màn hình "Đơn hàng" (`orders`). Làm đủ các bước:

1. **Model** — `src/app/core/models/order.model.ts`:
   ```ts
   export type OrderStatus = 'new' | 'paid' | 'cancelled';
   export interface Order { id: number; code: string; customer: string; total: number; status: OrderStatus; }
   export type OrderPayload = Omit<Order, 'id'>;
   ```
2. **Mock data** — thêm `MOCK_ORDERS` vào `src/app/mock_data/mock_data.ts` và đăng ký `orders: MOCK_ORDERS` trong `MOCK_DB` (key trùng đường dẫn `/api/orders`). Interceptor tự phục vụ GET/POST/PUT/DELETE.
3. **Service** — `src/app/core/services/order.service.ts`, `@Service()`, `implements CrudService<Order, OrderPayload>` (sao chép mẫu `user.service.ts`, url `/api/orders`).
4. **Màn hình** — `src/app/features/orders/order-list.ts` + `order-list.html` + `order-list.scss`:
   ```ts
   @Component({ selector: 'app-order-list', imports: [CrudPage], templateUrl: './order-list.html', styleUrl: './order-list.scss' })
   export class OrderList {
     protected readonly service = inject(OrderService);
     protected readonly pageActions: PageAction<Order>[] = [
       { label: 'Thêm đơn hàng', icon: 'plus', type: 'primary', handler: (page) => page.create() },
     ];
     protected readonly columns: TableColumn<Order>[] = [ /* ... */ ];
     protected readonly filters: TableFilter<Order>[] = [ /* ... */ ];
     protected readonly fields: FormField<Order>[] = [ /* ... */ ];
   }
   ```
   ```html
   <app-crud-page title="Đơn hàng" subtitle="..." entityName="đơn hàng" formMode="modal_form"
     [service]="service" [columns]="columns" [filters]="filters" [fields]="fields" [pageActions]="pageActions" />
   ```
   `order-list.scss` dùng đúng mẫu của `user-list.scss` (`:host` flex giãn đầy chiều cao).
5. **Route** — thêm vào `children` của `AdminLayout` trong `app.routes.ts` bằng `loadComponent` (lazy).
6. **Menu** — thêm `{ label, icon, route }` vào `MENU_ITEMS` trong `src/app/layout/admin-layout.ts`; **đăng ký icon** trong `app.config.ts`.
7. **Kiểm tra** theo mục 8.

Màn hình không phải CRUD: vẫn dùng `app-page-header` trong một card (`rounded-lg border border-line bg-surface shadow-sm`) và token, không tự dựng khung khác.

---

## 5. Tham chiếu API component dùng chung

### 5.1 `<app-crud-page>` (`shared/components/crud-page`)
| Input | Ý nghĩa |
|---|---|
| `title`, `subtitle` | Tiêu đề trang, mô tả (breadcrumb tự sinh: Trang chủ / title / thao tác) |
| `entityName` | Tên đối tượng viết thường ("người dùng") — dùng trong tiêu đề form, hộp xác nhận xóa |
| `service` | Object `CrudService<T, P>` (`getAll/create/update/delete`) |
| `columns`, `filters`, `fields` | Cấu hình bảng, bộ lọc, form (xem dưới) |
| `formMode` | `'modal_form'` (mặc định) hoặc `'inline_form'` (form thay chỗ bảng, chỉ vùng field cuộn) |
| `viewReadonly` | `true` (mặc định): xem chi tiết dạng văn bản; `false`: ô nhập bị vô hiệu hóa |
| `pageActions` | `PageAction<T>[]` — nút bên phải tiêu đề; `handler(page)` có `page.create()`, `page.reload()`, `page.data()` |

Cột thao tác (Xem / Sửa / Xóa có modal xác nhận) và nút Hủy / Thêm mới / Cập nhật / Đóng được dựng sẵn — **không tự viết lại**.

### 5.2 `TableColumn<T>` (bảng)
- `key`, `title`, `width` (nên khai báo, ví dụ `'160px'`), `align`.
- `type`: `'text'` (mặc định; `avatar`, `sub(row)`), `'number'` (canh phải, format hàng nghìn), `'tag'` (`tagColor(row)`, `tagText(row)`), `'status'` (`statuses: { 'true': { status: 'success', text: '...' } }`).
- `fixed: true` → cố định trái khi cuộn ngang (nên khai báo liền nhau từ cột đầu; cột STT tự cố định theo).
- Cột **STT** luôn có sẵn ở đầu, cột **Thao tác** luôn cố định phải — không khai báo trong `columns`.

### 5.3 `TableFilter<T>` (bộ lọc)
- `type`: `'text' | 'select' | 'number'`; `label` dùng làm placeholder + nhãn a11y.
- `searchKeys` (text, tìm "chứa", không phân biệt hoa thường), `options` (mảng hoặc hàm `(rows) => options`), `match(row, value)` cho điều kiện riêng.
- `advanced: true` → đưa vào popover "Tìm kiếm nâng cao". Lọc chỉ áp dụng khi bấm Tìm kiếm / Enter.

### 5.4 `FormField<T>` (form)
- `type`: `'text' | 'email' | 'number' | 'textarea' | 'select' | 'switch' | 'custom'`.
- `span`: độ rộng trên lưới 24 cột (24 = cả hàng, 12 = nửa hàng — mặc định, 6 = một phần tư). Khung form hẹp < 560px thì mọi field tự xuống cả hàng.
- `required`, `min`, `max`, `step`, `maxLength`, `options`, `switchLabels`, `defaultValue`, `placeholder`, `display(value)` (định dạng ở chế độ xem).
- **Thứ tự trong mảng = vị trí hiển thị.**
- Thông báo lỗi tiếng Việt tự sinh — không tự viết lại.

### 5.5 Field tùy biến (`type: 'custom'`)
Khai báo trong `.ts` như field thường (vị trí, `span`, `required`...), giao diện viết trong `.html` của trang:
```html
<app-crud-page ...>
  <ng-template appCrudField="category" let-control let-id="id">
    <input nz-input [id]="id" [formControl]="control" [nzAutocomplete]="auto" />
    <nz-autocomplete #auto>...</nz-autocomplete>
  </ng-template>
</app-crud-page>
```
- Luôn bind `[id]="id"` (để nhãn trỏ đúng) và `[formControl]="control"`; import `CrudFieldDef`, `ReactiveFormsModule` vào component trang.
- Nhãn, dấu `*`, thông báo lỗi, viền đỏ khi lỗi do `crud-form` lo. Xem mẫu đầy đủ: `features/products/product-list.html`.

---

## 6. Theme & design token

- Đổi theme: `ThemeService` (`core/services/theme.service.ts`) — `theme()`, `isDark()`, `setTheme()`, `toggle()`; lưu `localStorage['app-theme']`; đặt `<html data-theme="light|dark">`. Không tự đọc/ghi `data-theme` ở nơi khác.
- **Token toàn cục**: `--color-*` (primary, success, warning, error, text, bg, border...), `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--icon-size-*`, `--control-height-*`, `--focus-ring`.
- **Token component**: `--<component>-<phần>-<thuộc tính>[-<trạng thái>]`, ví dụ `--button-primary-bg-hover`, `--input-border-focus`, `--menu-item-active-bg`, `--table-header-bg`.
- **Thêm token**: khai báo trong `abstracts/_tokens.scss` (mặc định trỏ về token toàn cục); nếu khác nhau theo theme thì khai báo lại trong **cả hai** file theme. File theme **chỉ chứa giá trị**, không chứa rule style.
- **Hỗ trợ component ng-zorro mới**:
  1. Tạo `styles/components/_<tên>.scss`, bọc trong `@include m.ng-zorro-override { ... }`.
  2. Map màu / kích thước sang token, gồm cả các trạng thái mà ng-zorro gán màu cứng (`:hover`, `:focus`, `:active`, `[disabled]`) — copy đúng selector gốc của ng-zorro (tìm trong `node_modules/ng-zorro-antd/ng-zorro-antd.variable.css`) để thắng nhờ đứng sau.
  3. `@use` file đó trong `styles/styles.scss`.
  4. Kiểm tra ở cả 2 theme + axe.
- Màu primary / success / warning / error / info đã đi qua biến `--ant-*` (`vendors/_ng-zorro.scss`) nên tự đổi theo theme.
- Tag có màu preset (`nzColor="geekblue"`...) giữ bảng màu của ng-zorro (dark chưa có bảng riêng).

### Thứ tự cascade (quan trọng)
```
@layer theme, base, antd, components, utilities;   (khai báo trong src/styles.css)
```
- CSS gốc ng-zorro + mọi file `styles/components/_*.scss` dùng mixin → nằm trong layer `antd`.
- Class Tailwind (layer `utilities`) **luôn thắng** style ng-zorro → `m-0`, `flex`, `w-full` dùng được trực tiếp trên component ng-zorro.
- Rule **không layer** (token, `_layout.scss`, `_data-table.scss`) có ưu tiên cao nhất — chỉ dùng cho bố cục khung app.
- **Không** đặt rule ghi đè ng-zorro vào layer cao hơn `antd`: nó sẽ đè luôn mọi trạng thái hover/disabled/lỗi của ng-zorro.
- **Không** đưa Tailwind vào file SCSS (Tailwind v4 không chạy qua Sass).

---

## 7. Bẫy đã gặp (đọc trước khi sửa giao diện)

| Tình huống | Cách đúng |
|---|---|
| Class Tailwind "không ăn" trên component ng-zorro | Kiểm tra rule có nằm trong `@layer antd` không; không thêm `!important` bừa |
| Thẻ host của ng-zorro (`nz-input-wrapper`...) bỏ qua `width` | Bọc trong `<div class="w-...">` rồi đặt kích thước cho div |
| Bảng có `nzScroll`: dòng đầu `tbody` là dòng đo ẩn (`tr.ant-table-measure-now`) | Truy vấn dòng dữ liệu bằng `tr.ant-table-row` |
| Cột cố định không dính | Cần `[nzScroll]="{ x: '100%' }"` + `nzTableLayout="auto"` (đã có trong data-table) |
| Chiều cao select không đổi theo token | ng-zorro 22 đặt chiều cao trên `.ant-select-single.ant-select` (khung trong `height: 100%`) |
| Control trong template custom không đỏ viền khi lỗi | Khác injector với `nz-form-control`; crud-form đã truyền `[nzValidateStatus]` + CSS `.crud-cell` — đừng gỡ |
| Modal nháy nội dung khi đóng | Giữ trạng thái hiển thị cuối (xem `shown` = `linkedSignal` trong crud-form) |
| Sửa `angular.json` không thấy tác dụng | Khởi động lại `npm start` |
| Ghi file bằng PowerShell `Set-Content` | Sinh BOM làm hỏng JSON → dùng UTF-8 **không BOM** |
| Dữ liệu mock mất sau khi tải lại trang | Bình thường: mock lưu trong bộ nhớ |
| Ô "Danh mục" (autocomplete) trang Sản phẩm | Lỗi đã biết, có từ trước: mở gợi ý → Esc → focus lại báo lỗi console `classList of null`; dropdown có cảnh báo ARIA từ markup ng-zorro. Chưa sửa |

---

## 8. Kiểm tra trước khi báo xong

Không được báo "đã xong / đã qua" nếu chưa thực sự chạy:

1. `npx ng build` — không lỗi.
2. `npx ng test --watch=false` — pass.
3. Thay đổi có giao diện: chạy `npm start` và kiểm tra trên trình duyệt ở **cả light và dark**:
   - Không xô lệch: các control cùng hàng cùng chiều cao (32px mặc định) và thẳng tâm; lề trái/phải của breadcrumb, bộ lọc, bảng thẳng nhau (24px).
   - Trang không có thanh cuộn thừa; chỉ vùng bảng / vùng field của form inline được cuộn.
   - Overlay (modal, popover, dropdown, select, tooltip, message) đúng màu theme.
   - Chạy axe (WCAG AA) — 0 vi phạm mới.
4. Báo cáo trung thực: lệnh đã chạy + kết quả thật, chỗ chưa kiểm tra được, lỗi còn lại.

---

## 9. Git

- Chỉ commit / push khi người dùng yêu cầu. Nhánh chính: `main`, remote `origin` (GitHub).
- Commit message tiếng Việt: dòng tiêu đề ngắn + danh sách gạch đầu dòng các thay đổi chính.
- Không commit `node_modules`, `dist`, `.angular/cache`, `/.claude/skills/` (đã có trong `.gitignore`).
- Trước khi commit: rà `git status`, không đưa khóa bí mật / thông tin cá nhân vào repo.
