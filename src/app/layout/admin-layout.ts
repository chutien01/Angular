import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    NzAvatarModule,
    NzBadgeModule,
    NzDropdownModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
  ],
  template: `
    <nz-layout class="app-shell">
      <nz-sider class="app-sider" [nzWidth]="240" [nzCollapsed]="collapsed()" [nzTrigger]="null">
        <div class="flex h-14 items-center gap-3 px-6 text-white">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-lg">
            <nz-icon nzType="appstore" />
          </span>
          @if (!collapsed()) {
            <span class="truncate text-base font-semibold">Angular Base</span>
          }
        </div>
        <ul nz-menu nzTheme="dark" nzMode="inline" [nzInlineCollapsed]="collapsed()">
          <li nz-menu-item nzMatchRouter routerLink="/users">
            <nz-icon nzType="team" />
            <span>Người dùng</span>
          </li>
          <li nz-menu-item nzMatchRouter routerLink="/products">
            <nz-icon nzType="shopping" />
            <span>Sản phẩm</span>
          </li>
        </ul>
      </nz-sider>

      <nz-layout class="app-main">
        <nz-header class="app-header">
          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent text-lg text-slate-600"
            aria-label="Thu gọn/mở rộng menu"
            (click)="collapsed.set(!collapsed())"
          >
            <nz-icon [nzType]="collapsed() ? 'menu-unfold' : 'menu-fold'" />
          </button>

          <div class="flex items-center gap-5">
            <nz-badge [nzCount]="3" [nzOffset]="[2, 2]">
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent text-lg text-slate-600"
                aria-label="Thông báo"
              >
                <nz-icon nzType="bell" />
              </button>
            </nz-badge>

            <button
              type="button"
              class="flex cursor-pointer items-center gap-2 border-0 bg-transparent"
              nz-dropdown
              [nzDropdownMenu]="userMenu"
              nzPlacement="bottomRight"
            >
              <nz-avatar class="avatar-soft" nzText="QT" />
              <span class="font-medium text-slate-700">Quản trị viên</span>
              <nz-icon nzType="down" class="text-xs text-slate-400" />
            </button>
            <nz-dropdown-menu #userMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item><nz-icon nzType="user" /> Hồ sơ</li>
                <li nz-menu-item><nz-icon nzType="setting" /> Cài đặt</li>
                <li nz-menu-divider></li>
                <li nz-menu-item nzDanger><nz-icon nzType="logout" /> Đăng xuất</li>
              </ul>
            </nz-dropdown-menu>
          </div>
        </nz-header>

        <nz-content class="app-content p-6">
          <router-outlet />
        </nz-content>

        <nz-footer class="app-footer text-sm">
          <span>© 2026 Angular Base Admin. All rights reserved.</span>
          <span>Phiên bản 1.0.0</span>
        </nz-footer>
      </nz-layout>
    </nz-layout>
  `,
})
export class AdminLayout {
  protected readonly collapsed = signal(false);
}
