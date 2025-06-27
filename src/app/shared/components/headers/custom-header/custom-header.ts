import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../../../../core/models/user";
import { AuthService } from "../../../../core/services/auth/auth.service";

@Component({
  selector: "custom-header",
  templateUrl: "./custom-header.html",
  styleUrl: "./custom-header.scss",
})
export class CustomHeader implements OnInit {
  public isMenuOpen = false;
  public currentRoute!: string;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  public ngOnInit(): void {
    this.currentRoute = this.router.url;
    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public get currentUser(): User | null {
    return this._currentUser;
  }

  public navigate(path: string[]): void {
    this.router.navigate(path);
  }

  public logOut(): void {
    this.router.navigate(["access"]);
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public getRouteTitle(route: string): string {
    if (route == "/" || route == "")
      return "BEM VINDO " + this.currentUser?.name;

    if (route == "/group/add") return "ADICIONE UM GRUPO";

    if (route.match(/^\/group\/\w+/)) return "GERENCIE UM GRUPO";

    if (route == "/participant/add") return "ADICIONE UM PARITICIPANTE";

    if (route == "/vote") return "INICIAR VOTOS";

    if (route == "/votes/follow") return "ACOMPANHE OS VOTOS";

    if (route == "/votes/allow") return "AUTORIZE OS VOTOS";

    return "BEM VINDO";
  }

  public getRouteIcon(route: string): string {
    if (route == "/" || route == "") return "svg/red/home-icon.svg";

    if (route == "/group/add") return "svg/red/add-group-icon.svg";

    if (route.match(/^\/group\/\w+/)) return "svg/red/home-icon.svg";

    if (route == "/participant/add") return "svg/red/add-participant-icon.svg";

    if (route == "/vote") return "svg/red/start-vote-icon.svg";

    if (route == "/votes/follow") return "svg/red/follow-vote-icon.svg";

    if (route == "/votes/allow") return "svg/red/allow-vote-icon.svg";

    return "svg/red/home-icon.svg";
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
  }
}
