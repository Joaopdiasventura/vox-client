import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateSessionDto } from '../../../shared/dto/session/create-session.dto';
import { Observable } from 'rxjs';
import { Message } from '../../../shared/interfaces/messages';
import { FindSessionDto } from '../../../shared/dto/session/find-session.dto';
import { Session } from '../../models/session';
import { UpdateSessionDto } from '../../../shared/dto/session/update-session.dto';
import { Election } from '../../models/election';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly apiUrl = API_URL + '/session';
  private readonly http = inject(HttpClient);

  public create(createSessionDto: CreateSessionDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, createSessionDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public findMany(findSessionDto: FindSessionDto): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl, {
      headers: { authorization: localStorage.getItem('token')! },
      params: Object.fromEntries(
        Object.entries(findSessionDto)
          .filter(([, v]) => v != undefined && v != null && v != '')
          .map(([k, v]) => [k, String(v)]),
      ),
    });
  }

  public findById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}`, updateSessionDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public getElectionNames(elections: Election[]): string {
    if (elections.length == 1) return elections[0].name;

    if (elections.length == 2)
      return `${elections[0].name} e ${elections[1].name}`;

    const all = elections
      .slice(0, -1)
      .map((e) => e.name)
      .join(', ');

    const last = elections[elections.length - 1].name;

    return `${all} e ${last}`;
  }
}
