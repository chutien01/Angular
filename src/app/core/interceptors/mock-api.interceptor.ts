import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { MOCK_DB } from '../../mock_data/mock_data';

type Row = { id: number };

/** Bản sao dữ liệu trong bộ nhớ: thay đổi giữ nguyên cho tới khi tải lại trang. */
const db: Record<string, Row[]> = structuredClone(MOCK_DB);
const API_PATTERN = /^\/api\/([^/?]+)(?:\/(\d+))?\/?(?:\?.*)?$/;
const LATENCY_MS = 300;

/**
 * Giả lập backend REST cho `/api/<resource>[/:id]`.
 * Service vẫn dùng HttpClient như gọi API thật; muốn nối backend thật chỉ cần bỏ interceptor này.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const match = API_PATTERN.exec(req.url);
  const rows = match && db[match[1]];
  if (!match || !rows) {
    return next(req);
  }
  const id = match[2] ? Number(match[2]) : null;
  const index = id === null ? -1 : rows.findIndex((row) => row.id === id);

  const ok = (body: unknown, status = 200): Observable<HttpResponse<unknown>> =>
    of(new HttpResponse({ status, body })).pipe(delay(LATENCY_MS));
  const fail = (status: number, message: string): Observable<never> =>
    throwError(() => new HttpErrorResponse({ status, url: req.url, error: { message } })).pipe(
      delay(LATENCY_MS),
    );

  switch (req.method) {
    case 'GET':
      if (id === null) return ok(structuredClone(rows));
      return index < 0 ? fail(404, 'Không tìm thấy dữ liệu') : ok(structuredClone(rows[index]));
    case 'POST': {
      const created: Row = { ...(req.body as object), id: Math.max(0, ...rows.map((r) => r.id)) + 1 };
      rows.push(created);
      return ok(structuredClone(created), 201);
    }
    case 'PUT':
      if (index < 0) return fail(404, 'Không tìm thấy dữ liệu');
      rows[index] = { ...(req.body as object), id: id as number };
      return ok(structuredClone(rows[index]));
    case 'DELETE':
      if (index < 0) return fail(404, 'Không tìm thấy dữ liệu');
      rows.splice(index, 1);
      return ok(null, 204);
    default:
      return fail(405, 'Method không được hỗ trợ');
  }
};
