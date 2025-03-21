import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);

  private userDataSource = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public get loading$() {
    return this.loadingSubject.asObservable();
  }

  public connectUser(user?: User | null): Observable<User | null> {
    if (user) this.updateUserData(user);
    if (this.currentUserData) return of(this.currentUserData);

    if (isPlatformServer(this.platformId)) return of(null);

    const token = localStorage.getItem('token');
    if (!token) return of(null);

    this.loadingSubject.next(true);

    return this.userService.decodeToken(token).pipe(
      tap((result) => this.updateUserData(result)),
      map((result) => {
        this.loadingSubject.next(false);
        return result;
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }

  public disconnectUser() {
    if (isPlatformServer(this.platformId)) return;
    localStorage.removeItem('token');
    this.updateUserData(null);
  }

  public updateUserData(data: User | null) {
    this.userDataSource.next(data);
  }

  private get currentUserData() {
    return this.userDataSource.value;
  }
}
