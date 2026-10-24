import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppstoreOutline,
  ArrowLeftOutline,
  ArrowRightOutline,
  BellOutline,
  DeleteOutline,
  DownOutline,
  EditOutline,
  ExclamationCircleOutline,
  EyeOutline,
  FilterOutline,
  LogoutOutline,
  MoonOutline,
  PlusOutline,
  ReloadOutline,
  SearchOutline,
  SettingOutline,
  ShoppingOutline,
  SunOutline,
  TeamOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import { ThemeService } from './core/services/theme.service';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // Đồng bộ theme đã lưu (light mặc định) ngay khi khởi động app.
    provideAppInitializer(() => inject(ThemeService).init()),
    provideRouter(routes),
    // Mock API: bỏ interceptor này khi nối backend thật.
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideNzI18n(en_US),
    provideNzIcons([
      AppstoreOutline,
      ArrowLeftOutline,
      ArrowRightOutline,
      BellOutline,
      DeleteOutline,
      DownOutline,
      EditOutline,
      ExclamationCircleOutline,
      EyeOutline,
      FilterOutline,
      LogoutOutline,
      MoonOutline,
      PlusOutline,
      ReloadOutline,
      SearchOutline,
      SettingOutline,
      ShoppingOutline,
      SunOutline,
      TeamOutline,
      UserOutline,
    ]),
    provideNzDateFnsAdapter(),
  ],
};
