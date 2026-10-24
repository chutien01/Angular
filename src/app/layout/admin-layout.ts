import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Người dùng', icon: 'team', route: '/users' },
  { label: 'Sản phẩm', icon: 'shopping', route: '/products' },
];

/** Bỏ dấu tiếng Việt và viết thường để "nguoi" tìm được "Người dùng". */
const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

@Component({
  selector: 'app-admin-layout',
  imports: [
    FormsModule,
    RouterOutlet,
    RouterLink,
    NzAvatarModule,
    NzBadgeModule,
    NzButtonModule,
    NzDropdownModule,
    NzIconModule,
    NzInputModule,
    NzLayoutModule,
    NzMenuModule,
    NzTooltipModule,
  ],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly collapsed = signal(false);
  protected readonly toggleLabel = computed(() => (this.collapsed() ? 'Mở rộng menu' : 'Thu gọn menu'));

  /** Nội dung đang gõ trong ô tìm menu; chỉ áp dụng khi nhấn Enter. */
  protected readonly menuDraft = signal('');
  private readonly menuKeyword = signal('');
  protected readonly menuItems = computed(() => {
    const keyword = normalize(this.menuKeyword());
    return keyword ? MENU_ITEMS.filter((item) => normalize(item.label).includes(keyword)) : MENU_ITEMS;
  });

  protected searchMenu(): void {
    this.menuKeyword.set(this.menuDraft());
  }

  protected clearMenuSearch(): void {
    this.menuDraft.set('');
    this.menuKeyword.set('');
  }
}
