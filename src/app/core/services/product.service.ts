import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from '../models/crud-service.model';
import { Product, ProductPayload } from '../models/product.model';

@Service()
export class ProductService implements CrudService<Product, ProductPayload> {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/products';

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  create(payload: ProductPayload): Observable<Product> {
    return this.http.post<Product>(this.url, payload);
  }

  update(id: number, payload: ProductPayload): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
