import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/user/auth/auth.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { CreateUserDto } from 'src/app/shared/dto/user/create-user.dto';
import { LoginUserDto } from 'src/app/shared/dto/user/login-user.dto';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonInput,
  IonList,
  IonImg,
  IonInputPasswordToggle,
  SegmentCustomEvent,
} from '@ionic/angular/standalone';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { User } from '../../../../core/models/user';
import { CustomButtonComponent } from '../../../../shared/components/custom/custom-button/custom-button.component';
import { UiStateService } from 'src/app/shared/services/ui-state/ui-state.service';

@Component({
  selector: 'app-access-page',
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonInput,
    IonList,
    IonImg,
    IonInputPasswordToggle,
    CustomButtonComponent,
  ],
  templateUrl: './access-page.component.html',
  styleUrls: ['./access-page.component.scss'],
})
export class AccessPageComponent implements OnInit {
  public isRegisterActive = signal(false);

  private readonly socketService = inject(SocketService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly uiStateService = inject(UiStateService);

  private readonly emailValidator = [
    '',
    [Validators.required, Validators.email],
  ];
  private readonly passwordValidator = [
    '',
    [
      Validators.required,
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d@$!%*?&_#]{8,}$/,
      ),
    ],
  ];

  public ngOnInit(): void {
    this.authService.disconnectUser();
  }

  public readonly loginForm = this.fb.group({
    email: this.emailValidator,
    password: this.passwordValidator,
  });

  public readonly createForm = this.fb.group({
    name: ['', Validators.required],
    email: this.emailValidator,
    password: this.passwordValidator,
  });

  public changeForm(): void {
    this.isRegisterActive.update((value) => !value);
  }

  public onSegmentChange(ev: SegmentCustomEvent): void {
    const value = ev.detail.value;
    this.isRegisterActive.set(value == 'register');
  }

  public login(): void {
    this.uiStateService.setLoading(true);
    this.userService.login(this.loginForm.value as LoginUserDto).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.authService.updateUserData(response.user);
        this.uiStateService.setLoading(false);
        this.router.navigate(['/']);
      },
      error: ({ error }) => {
        this.uiStateService.setModalConfig({
          icon: 'white/error',
          title: 'Ops! Algo está errado',
          message: error.message,
          onClose: () => this.uiStateService.setModalConfig(null),
        });
        this.uiStateService.setLoading(false);
      },
    });
  }

  public create(): void {
    const dto = this.createForm.value as CreateUserDto;
    this.uiStateService.setLoading(true);
    this.userService.create(dto).subscribe({
      next: () => {
        this.uiStateService.setModalConfig({
          icon: 'white/hourglass',
          title: 'Aguardando sua resposta',
          message: 'Mandamos um email para validar sua conta',
        });
        this.uiStateService.setLoading(false);
        this.socketService.open(dto.email);
        this.socketService.on(
          'email-validated',
          this.onAccountValidated.bind(this),
        );
      },
      error: ({ error }) => {
        this.uiStateService.setModalConfig({
          icon: 'white/error',
          title: 'Ops! Algo está errado',
          message: error.message,
          onClose: () => this.uiStateService.setModalConfig(null),
        });
        this.uiStateService.setLoading(false);
      },
    });
  }

  public resetPassword(): void {
    const dto = this.loginForm.value as LoginUserDto;
    if (!dto.email.trim()) return;
    this.uiStateService.setLoading(true);
    this.userService.resetPassword(dto.email).subscribe({
      next: () => {
        this.uiStateService.setModalConfig({
          icon: 'white/hourglass',
          title: 'Verifique seu email',
          message: 'Mandamos um email para recuperar sua conta',
          onClose: () => this.uiStateService.setModalConfig(null),
        });
        this.uiStateService.setLoading(false);
      },
      error: ({ error }) => {
        this.uiStateService.setModalConfig({
          icon: 'white/error',
          title: 'Ops! Algo está errado',
          message: error.message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
          },
        });
        this.uiStateService.setLoading(false);
      },
    });
  }

  private onAccountValidated(user: User): void {
    this.authService.updateUserData(user);
    this.uiStateService.setModalConfig({
      icon: 'white/sucess',
      title: 'Perfeito',
      message: 'Conta validada com sucesso',
      onClose: () => {
        this.router.navigate(['/']);
        this.uiStateService.setModalConfig(null);
      },
    });
  }
}
