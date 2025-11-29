import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/user/auth/auth.service';
import { User } from '../../models/user';
import { UserService } from '../../services/user/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      switchMap((user) => this.connectUser(user)),
    );
  }

  private connectUser(user: User | null): Observable<boolean | UrlTree> {
    if (user) return of(true);

    const token = localStorage.getItem('token');
    if (!token) return of(this.router.parseUrl('/user/access'));

    return this.userService.decodeToken(token).pipe(
      map((decodedUser) => !!this.authService.updateUserData(decodedUser)),
      catchError(() => of(this.router.parseUrl('/user/access'))),
    );
  }
}
