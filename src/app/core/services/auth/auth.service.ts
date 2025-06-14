import { isPlatformServer } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, of, map, catchError } from "rxjs";
import { User } from "../../models/user";
import { UserService } from "../user/user.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private router = inject(Router);

  private userDataSource = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public get currentUserData(): User | null {
    return this.userDataSource.value;
  }

  public get currentUserData$(): Observable<User | null> {
    return this.userDataSource.asObservable();
  }

  public get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public connectUser(user?: User | null): Observable<User | null> {
    if (user) this.updateUserData(user);

    if (this.currentUserData) return of(this.currentUserData);

    if (isPlatformServer(this.platformId)) return of(null);

    const token = localStorage.getItem("token");
    if (!token) {
      this.router.navigate(["access"]);
      return of(null);
    }

    this.loadingSubject.next(true);

    return this.userService.decodeToken(token).pipe(
      map((result) => {
        this.updateUserData(result);
        this.loadingSubject.next(false);
        return result;
      }),
      catchError(() => {
        this.router.navigate(["access"]);
        this.loadingSubject.next(false);
        return of(null);
      }),
    );
  }

  public disconnectUser(): void {
    if (isPlatformServer(this.platformId)) return;
    localStorage.removeItem("token");
    this.updateUserData(null);
  }

  public updateUserData(data: User | null): void {
    this.userDataSource.next(data);
  }
}
