import { WebSocketService } from "./core/services/web-socket/web-socket.service";
import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { LoadingPage } from "./shared/components/loadings/loading-page/loading-page";
import { AuthService } from "./core/services/auth/auth.service";
import { User } from "./core/models/user";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, LoadingPage],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App implements OnInit {
  public isLoading = false;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);

  private router = inject(Router);

  public ngOnInit(): void {
    this.authService.loading$.subscribe((loading: boolean) =>
      setTimeout(() => (this.isLoading = loading), 0),
    );
    this.authService.currentUserData$.subscribe((user) =>
      this.handleUserConnection(user),
    );
  }

  public get currentUser(): User | null {
    return this._currentUser;
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    if (!user.isEmailValid) this.listenToAccountValidation();
  }

  private listenToAccountValidation(): void {
    if (!this._currentUser) return;
    this.webSocketService.open(this._currentUser.email);
    this.webSocketService.emit("wait-validation", this._currentUser.email);
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
