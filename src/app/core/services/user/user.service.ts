import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateUserDto } from '../../../shared/dto/user/create-user.dto';
import { Observable } from 'rxjs';
import { AuthMessage } from '../../../shared/interfaces/messages/auth';
import { LoginUserDto } from '../../../shared/dto/user/login-user.dto';
import { User } from '../../models/user';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = API_URL + '/user';
  private readonly http = inject(HttpClient);

  public create(createUserDto: CreateUserDto): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(this.apiUrl, createUserDto);
  }

  public login(loginUserDto: LoginUserDto): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(this.apiUrl + '/login', loginUserDto);
  }

  public decodeToken(token: string): Observable<User> {
    return this.http.get<User>(this.apiUrl + '/decodeToken/' + token);
  }
}
