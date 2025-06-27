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

  private router = inject(Router);

  public ngOnInit(): void {
    this.authService.loading$.subscribe((loading: boolean) =>
      setTimeout(() => (this.isLoading = loading), 0),
    );

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
    if ((this.router.url != "/access", !user.isEmailValid))
      this.router.navigate(["verify", "email"]);
    this._currentUser = user;
  }
}
