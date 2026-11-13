import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = typeof window !== 'undefined' ? localStorage.getItem('@estoque:token') : null;

  let authReq = req;
  if (token && !req.url.includes('/auth/login')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 403 or 401 when accessing protected endpoints
      if ((error.status === 403 || error.status === 401) && !req.url.includes('/auth/login')) {
        localStorage.removeItem('@estoque:token');
        localStorage.removeItem('@estoque:user');
        toast.error('Sessão expirada ou sem permissão. Faça login novamente.');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
