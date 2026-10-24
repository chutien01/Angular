import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      { path: 'users', loadComponent: () => import('./features/users/user-list').then((m) => m.UserList) },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list').then((m) => m.ProductList),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
