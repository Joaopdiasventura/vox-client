import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private router = inject(Router);

  public canActivate(): Observable<boolean> {
    if (isPlatformServer(this.platformId)) return of(false);
    return this.authService
      .connectUser()
      .pipe(
        map((result) => (result ? true : !this.router.navigate(['access'])))
      );
  }
}
