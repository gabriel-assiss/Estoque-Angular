import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (authService.isAuthenticated()) {
    return true;
  }

  toast.warning('Por favor, faça login para acessar esta página.');
  router.navigate(['/login']);
  return false;
};
