import { Component, HostBinding, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { UserService } from "../../../../core/services/user/user.service";
import { ModalConfig } from "../../../../shared/interfaces/config/modal";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../../shared/components/modals/modal/modal";
import { AccessInput } from "../../../../shared/components/inputs/access-input/access-input";
import { NgStyle } from "@angular/common";
import { CustomButton } from "../../../../shared/components/buttons/custom-button/custom-button";

@Component({
  selector: "app-access-page",
  imports: [
    ReactiveFormsModule,
    NgStyle,
    Loading,
    Modal,
    AccessInput,
    CustomButton,
  ],
  templateUrl: "./access-page.html",
  styleUrl: "./access-page.scss",
})
export class AccessPage implements OnInit {
  public isInLogin = true;
  public isLoading = false;

  public loginForm!: FormGroup;
  public createForm!: FormGroup;

  public modalConfig!: ModalConfig;

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  public ngOnInit(): void {
    this.authService.disconnectUser();
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
    this.createForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  @HostBinding("class.login-mode") public get loginMode(): boolean {
    return this.isInLogin;
  }
  @HostBinding("class.register-mode") public get registerMode(): boolean {
    return !this.isInLogin;
  }

  public toggle(mode: "login" | "register"): void {
    this.isInLogin = mode == "login";
  }

  public changeMethod(): void {
    this.isInLogin = !this.isInLogin;
  }

  public login(): void {
    if (this.loginForm.invalid) {
      const field = this.loginForm.get("email")!.invalid
        ? "login-email-input"
        : "login-password-input";
      return document.getElementById(field)?.focus();
    }
    this.isLoading = true;
    this.userService.login(this.loginForm.value).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          icon: "svg/white/check-icon.svg",
          title: "BEM VINDO",
          children: result.message,
          onClose: (): void => {
            localStorage.setItem("token", result.token);
            this.authService.updateUserData(result.user);
            this.router.navigate(
              result.user.isEmailValid ? [""] : ["verify", "email"],
            );
          },
        };
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          icon: "svg/white/warn-icon.svg",
          title: "ERRO",
          children:
            typeof error.error.message == "string"
              ? error.error.message
              : error.error.message[0],
          onClose: (): void => {
            this.modalConfig = { ...this.modalConfig, isVisible: false };
          },
        };
        this.isLoading = false;
      },
    });
  }

  public create(): void {
    if (this.createForm.invalid) {
      const field = this.createForm.get("email")!.invalid
        ? "create-email-input"
        : this.createForm.get("name")!.invalid
          ? "create-name-input"
          : "create-password-input";
      return document.getElementById(field)?.focus();
    }

    this.isLoading = true;
    this.userService.create(this.createForm.value).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          icon: "svg/white/check-icon.svg",
          title: "BEM VINDO",
          children: result.message,
          onClose: (): void => {
            localStorage.setItem("token", result.token);
            this.authService.updateUserData(result.user);
            this.router.navigate(
              result.user.isEmailValid ? [""] : ["verify", "email"],
            );
          },
        };

        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          icon: "svg/white/warn-icon.svg",
          title: "ERRO",
          children:
            typeof error.error.message == "string"
              ? error.error.message
              : error.error.message[0],
          onClose: (): void => {
            this.modalConfig = { ...this.modalConfig, isVisible: false };
          },
        };
        this.isLoading = false;
      },
    });
  }
}
