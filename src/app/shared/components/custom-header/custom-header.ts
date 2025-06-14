import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "custom-header",
  imports: [],
  templateUrl: "./custom-header.html",
  styleUrl: "./custom-header.scss",
})
export class CustomHeader {
  public isMenuOpen = false;

  private router = inject(Router);

  public navigate(path: string[]): void {
    this.router.navigate(path);
  }

  public logOut(): void {
    this.router.navigate(["access"]);
  }

  public viewGroupDetails(id: string): void {
    const token = localStorage.getItem("token");
    this.router.navigate(["group", id, token]);
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
