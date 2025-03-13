import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private router = inject(Router);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public canActivate(): Observable<boolean> {
    if (isPlatformServer(this.platformId)) return of(false);
    const user = this.userService.getCurrentData();

    if (user) return of(true);
    return this.connectUser();
  }

  private connectUser(): Observable<boolean> {
    if (!localStorage) return of(true);

    const token = localStorage.getItem('token');
    if (!token) return of(!this.router.navigate(['access']));

    this.loadingSubject.next(true);

    return this.userService.decodeToken(token).pipe(
      tap((user: User) => this.userService.updateData(user)),
      map(() => {
        this.loadingSubject.next(false);
        return true;
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        this.router.navigate(['access']);
        return of(false);
      })
    );
  }

  public get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
}
