import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  template: `
    <div class="login-wrapper min-h-screen flex align-items-center justify-content-center">
      <div class="login-container flex flex-column md:flex-row shadow-8 overflow-hidden">
        <!-- Sidebar -->
        <div class="brand-side flex flex-column align-items-center justify-content-center px-4 py-4">
           <div class="logo-container mb-3">
              <img src="/logo_square.png" alt="Youros" class="ref-logo-square" />
           </div>
           
           <div class="brand-pill-container mb-2 w-full px-2">
              <div class="ref-pill text-center py-1 font-bold">Youros</div>
           </div>

           <p class="ref-description text-center mt-1 px-1">
              Zone One is a product of YOUROS TECHNOLOGIES made for managing bills, ledgers, and inventory of a Indoor Gaming Zone. Designed to streamline operations and ensure financial accuracy.
           </p>
        </div>

        <!-- Form -->
        <div class="login-side bg-white px-5 py-3 flex flex-column justify-content-center">
           <div class="text-center mb-2">
              <img src="/logo.png" alt="Youros" class="ref-logo-full" />
           </div>

           <div class="mb-3 w-full">
              <div class="ref-pill-outline text-center py-1 font-bold text-700">Youros</div>
           </div>

           <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-2">
              <div class="field mb-1">
                 <input pInputText formControlName="userName" placeholder="User Name" class="ref-input w-full" />
              </div>

              <div class="field mb-1">
                 <p-password formControlName="password" [toggleMask]="true" [feedback]="false" 
                            placeholder="Password" styleClass="w-full" inputStyleClass="ref-input w-full">
                 </p-password>
              </div>

              <div class="flex align-items-center gap-2 mb-2 mt-1">
                 <p-checkbox formControlName="rememberMe" [binary]="true" inputId="remCheck"></p-checkbox>
                 <label for="remCheck" class="text-xs text-500 cursor-pointer">Remember password</label>
              </div>

              <p-button label="Sign in" type="submit" [loading]="loading()"
                       styleClass="ref-btn w-full font-bold">
              </p-button>
           </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      background-image: url('/login_background.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .login-container {
      width: 100%;
      max-width: 720px; /* Narrowed slightly more */
      min-height: 340px; /* Reduced to 360px */
      border-radius: 4px;
    }

    /* ---- Left Side ---- */
    .brand-side {
      background-color: #055a87;
      color: #ffffff;
      flex: 1;
      min-width: 320px;
    }

    .ref-logo-square {
      width: 110px; /* Scaled down */
      height: auto;
      filter: brightness(0) invert(1);
    }

    .ref-pill {
      background: #ffffff;
      color: #055a87;
      border-radius: 20px;
      font-size: 0.9rem;
      width: 100%;
    }

    .ref-description {
      font-size: 0.72rem; /* Scaled down */
      line-height: 1.5;
      opacity: 0.9;
      max-width: 260px;
      font-weight: 400;
      color: white;
    }

    /* ---- Right Side ---- */
    .login-side {
      flex: 1;
      width: 400px;
    }

    .ref-logo-full {
      max-height: 50px; /* Scaled down */
      width: auto;
    }

    .ref-pill-outline {
      border: 1px solid #e1e9e9;
      border-radius: 20px;
      font-size: 0.88rem;
    }

    /* Input Styling */
    ::ng-deep {
      .ref-input {
        background: #fcfcfc !important;
        border: 1px solid #d8e4e4 !important;
        border-radius: 3px !important;
        padding: 0.5rem 0.8rem !important;
        font-size: 0.88rem !important;
        color: #4b5563 !important;

        &:focus {
           border-color: #055a87 !important;
           box-shadow: none !important;
        }
      }
      .p-checkbox .p-checkbox-box {
          border-radius: 2px !important;
          width: 14px !important; height: 14px !important;
          border: 1px solid #d8d8d8 !important;
          transition: all 0.2s !important;
      }
      /* Remember Me Checkbox Color Sync */
      .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
          border-color: #055a87 !important;
      }
      .p-checkbox.p-checkbox-checked .p-checkbox-box {
          background: #055a87 !important;
          border-color: #055a87 !important;
      }
      .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-focus {
          box-shadow: 0 0 0 0.1rem rgba(5, 90, 135, 0.2) !important;
          border-color: #055a87 !important;
      }
    }

    .ref-btn {
      background: #055a87 !important;
      border: none !important;
      border-radius: 3px !important;
      padding: 0.6rem !important;
      font-size: 0.9rem !important;
    }

    @media (max-width: 768px) {
        .login-container {
           max-width: 380px;
           margin: 1rem;
        }
        .brand-side { display: none; }
        .login-side { width: 100%; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(false);

  loginForm = this.fb.group({
    userName: [localStorage.getItem('rememberedUser') || '', [Validators.required]],
    password: [localStorage.getItem('temp_pass') ? atob(localStorage.getItem('temp_pass')!) : '', [Validators.required]],
    rememberMe: [!!localStorage.getItem('rememberedUser')]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    const { userName, password, rememberMe } = this.loginForm.value;

    this.authService.login(userName!, password!).subscribe({
      next: (user) => {
        if (user.id) {
          if (rememberMe) {
            localStorage.setItem('rememberedUser', userName!);
            localStorage.setItem('temp_pass', btoa(password!)); // Obfuscated storage
          } else {
            localStorage.removeItem('rememberedUser');
            localStorage.removeItem('temp_pass');
          }

          this.messageService.add({ severity: 'success', summary: 'Welcome', detail: `Logged in as ${user.fullName}` });
          this.router.navigate(['/dashboard']);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid credentials' });
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Server error or invalid credentials' });
        this.loading.set(false);
      }
    });
  }
}
