import { Component, inject, OnInit } from "@angular/core";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { WebSocketService } from "../../../../core/services/web-socket/web-socket.service";
import { Router } from "@angular/router";
import { User } from "../../../../core/models/user";
import { Modal } from "../../../../shared/components/modals/modal/modal";

@Component({
  selector: "app-verify-email-page",
  imports: [Modal],
  templateUrl: "./verify-email-page.html",
  styleUrl: "./verify-email-page.scss",
})
export class VerifyEmailPage implements OnInit {
  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);

  private router = inject(Router);

  public ngOnInit(): void {
    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();
    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public get currentUser(): User | null {
    return this._currentUser;
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    if (!user.isEmailValid) this.listenToAccountValidation(user.email);
    this._currentUser = user;
  }

  private listenToAccountValidation(email: string): void {
    this.webSocketService.open(email);
    this.webSocketService.emit("wait-validation", email);
    this.webSocketService.on("account-validated", () =>
      this.onAccountValidated(),
    );
  }

  private onAccountValidated(): void {
    if (!this._currentUser) return;
    this.authService
      .connectUser({ ...this._currentUser, isEmailValid: true })
      .subscribe(() => {
        this.router.navigate([""]);
      });
    this.webSocketService.close();
  }
}
