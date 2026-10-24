import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, computed, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

/** Khóa lưu theme trong localStorage — trùng với script chống chớp trong src/index.html. */
const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: AppTheme = 'light';

const isTheme = (value: unknown): value is AppTheme => value === 'light' || value === 'dark';

/**
 * Quản lý theme toàn cục: đặt `data-theme` trên <html> để các design token
 * (src/styles/themes) đổi giá trị; đổi tức thì, không cần tải lại trang.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly current = signal<AppTheme>(DEFAULT_THEME);
  readonly theme = this.current.asReadonly();
  readonly isDark = computed(() => this.current() === 'dark');

  /** Đọc theme đã lưu (giá trị không hợp lệ thì dùng light) và áp lên trang. */
  init(): void {
    this.apply(this.readStored() ?? DEFAULT_THEME, false);
  }

  setTheme(theme: AppTheme): void {
    this.apply(theme, true);
  }

  toggle(): void {
    this.setTheme(this.current() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: AppTheme, persist: boolean): void {
    this.current.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      this.store(theme);
    }
  }

  private readStored(): AppTheme | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return isTheme(value) ? value : null;
    } catch {
      return null;
    }
  }

  private store(theme: AppTheme): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư...): theme vẫn áp dụng, chỉ không được lưu lại.
    }
  }
}
