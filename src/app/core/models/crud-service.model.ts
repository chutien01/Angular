import { Observable } from 'rxjs';

/** API CRUD tối thiểu mà trang quản trị dùng chung (`app-crud-page`) cần từ một service. */
export interface CrudService<T, P> {
  getAll(): Observable<T[]>;
  create(payload: P): Observable<T>;
  update(id: number, payload: P): Observable<T>;
  delete(id: number): Observable<void>;
}
