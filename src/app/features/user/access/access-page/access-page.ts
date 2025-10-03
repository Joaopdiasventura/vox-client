import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/user/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';
import { LoginUserDto } from '../../../../shared/dto/user/login-user.dto';
import { CreateUserDto } from '../../../../shared/dto/user/create-user.dto';
import { AuthMessage } from '../../../../shared/interfaces/messages/auth';
import { Loading } from '../../../../shared/components/loadings/loading/loading';
import { ModalConfig } from '../../../../shared/interfaces/modals/modal-config';
import { Modal } from '../../../../shared/components/modals/modal/modal';

@Component({
  selector: 'app-access-page',
  imports: [ReactiveFormsModule, Loading, Modal],
  templateUrl: './access-page.html',
  styleUrl: './access-page.scss',
})
export class AccessPage {
  public isRegisterActive = signal(false);
  public isLoading = signal(false);
  public showModalConfig = signal(true);

  public modalConfig = signal<ModalConfig | null>(null);

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly nameValidator = ['', Validators.required];
  private readonly emailValidator = ['', [Validators.required, Validators.email]];
  private readonly passwordValidator = [
    '',
    [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/),
    ],
  ];

  public readonly loginForm = this.fb.group({
    email: this.emailValidator,
    password: this.passwordValidator,
  });

  public readonly createForm = this.fb.group({
    name: this.nameValidator,
    email: this.emailValidator,
    password: this.passwordValidator,
  });

  public changeForm(): void {
    this.isRegisterActive.update((value) => !value);
  }

  public onSubmit(): void {
    const action$ = this.isRegisterActive()
      ? this.create(this.createForm)
      : this.login(this.loginForm);

    this.isLoading.set(true);
    action$.subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.showModalConfig.set(true);
        this.authService.updateUserData(response.user);
        this.modalConfig.set({
          title: 'BEM VINDO',
          message: response.message,
          hasError: false,
          onClose: (): void => {
            this.router.navigate(['']);
          },
        });
        localStorage.setItem('token', response.token);
      },
      error: ({ error }) => {
        this.isLoading.set(false);
        this.showModalConfig.set(true);
        this.modalConfig.set({
          title: 'ALGO DEU ERRADO',
          message: error.message,
          hasError: true,
          onClose: (): void => {
            this.showModalConfig.set(false);
          },
        });
      },
    });
  }

  private login(form: FormGroup): Observable<AuthMessage> {
    const loginUserDto = form.value as LoginUserDto;
    return this.userService.login(loginUserDto);
  }

  private create(form: FormGroup): Observable<AuthMessage> {
    const createUserDto = form.value as CreateUserDto;
    return this.userService.create(createUserDto);
  }
}
