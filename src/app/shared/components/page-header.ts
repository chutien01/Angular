import { Component, input } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-page-header',
  imports: [NzBreadCrumbModule],
  template: `
    <div class="mb-6">
      <nz-breadcrumb class="mb-2">
        <nz-breadcrumb-item>Trang chủ</nz-breadcrumb-item>
        <nz-breadcrumb-item>{{ title() }}</nz-breadcrumb-item>
      </nz-breadcrumb>
      <h1 class="m-0 text-2xl font-semibold text-slate-900">{{ title() }}</h1>
      <p class="m-0 mt-1 text-slate-600">{{ subtitle() }}</p>
    </div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
