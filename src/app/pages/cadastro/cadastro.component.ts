import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly cadastroForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    cargo: ['', [Validators.required]],
    matricula: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    role: ['PADRAO']
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cadastroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const formData = this.cadastroForm.value;

    this.authService.register(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        let msg = 'Erro ao realizar cadastro. Verifique os dados informados.';
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (typeof err.error === 'object') {
            const firstKey = Object.keys(err.error)[0];
            if (firstKey) {
              msg = `${firstKey}: ${err.error[firstKey]}`;
            }
          }
        }
        this.errorMessage.set(msg);
        this.toast.error(msg);
      }
    });
  }
}
