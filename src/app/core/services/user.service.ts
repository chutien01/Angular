import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserPayload } from '../models/user.model';

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  create(payload: UserPayload): Observable<User> {
    return this.http.post<User>(this.url, payload);
  }

  update(id: number, payload: UserPayload): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
