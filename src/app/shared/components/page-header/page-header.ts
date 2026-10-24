import { Component, input } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-page-header',
  imports: [NzBreadCrumbModule],
  templateUrl: './page-header.html',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  /** Mục cuối của breadcrumb, ví dụ "Thêm mới" khi đang mở form inline. */
  readonly current = input<string>();
}
