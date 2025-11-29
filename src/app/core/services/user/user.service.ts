import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserDto } from 'src/app/shared/dto/user/create-user.dto';
import { LoginUserDto } from 'src/app/shared/dto/user/login-user.dto';
import { Message } from 'src/app/shared/interfaces/messages';
import { AuthMessage } from 'src/app/shared/interfaces/messages/auth';
import { User } from '../../models/user';
import { UpdateUserDto } from '../../../shared/dto/user/update-user.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = API_URL + '/user';
  private readonly http = inject(HttpClient);

  public create(createUserDto: CreateUserDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, createUserDto);
  }

  public login(loginUserDto: LoginUserDto): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(this.apiUrl + '/login', loginUserDto);
  }

  public decodeToken(token: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/decodeToken/${token}`);
  }

  public update(updateUserDto: UpdateUserDto): Observable<Message> {
    return this.http.patch<Message>(this.apiUrl, updateUserDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public validateAccount(token: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/validateAccount/${token}`, {});
  }

  public resetPassword(email: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/resetPassword/${email}`, {});
  }
}
