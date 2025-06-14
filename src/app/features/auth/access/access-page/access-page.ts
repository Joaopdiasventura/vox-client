import { Component, inject, OnInit } from "@angular/core";
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
import { CustomInput } from "../../../../shared/components/custom-input/custom-input";
import { CustomButton } from "../../../../shared/components/custom-button/custom-button";

@Component({
  selector: "app-access-page",
  imports: [ReactiveFormsModule, Loading, Modal, CustomInput, CustomButton],
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
      email: ["", [Validators.required, Validators.email]],
      name: ["", Validators.required],
      password: ["", Validators.required],
    });
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
          title: "LOGIN REALIZADO COM SUCESSO",
          children: result.message,
          onClose: (): void => {
            this.router.navigate([""]);
          },
        };
        localStorage.setItem("token", result.token);
        this.authService.updateUserData(result.user);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          title: "ERRO AO REALIZAR O LOGIN",
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
          title: "USUÁRIO CRIADO COM SUCESSO",
          children: result.message,
          onClose: (): void => {
            this.router.navigate([""]);
          },
        };
        localStorage.setItem("token", result.token);
        this.authService.updateUserData(result.user);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          title: "ERRO AO CRIAR O USUÁRIO",
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
