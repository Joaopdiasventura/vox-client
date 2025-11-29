import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/app/core/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userDataSource = new BehaviorSubject<User | null>(null);

  public get user$(): Observable<User | null> {
    return this.userDataSource.asObservable();
  }

  public updateUserData(data: User | null): User | null {
    this.userDataSource.next(data);
    return data;
  }

  public disconnectUser(): void {
    this.updateUserData(null);
    localStorage.removeItem('token');
  }
}
