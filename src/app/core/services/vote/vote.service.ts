import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../../shared/interfaces/messages';
import { CreateVoteDto } from '../../../shared/dto/vote/create-vote.dto';
import { VoteResult } from '../../models/vote';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  private readonly apiUrl = API_URL + '/vote';
  private readonly http = inject(HttpClient);

  public create(createVoteDto: CreateVoteDto): Observable<Message> {
    const payload = { ...createVoteDto };
    if (payload.candidate === undefined) delete payload.candidate;
    return this.http.post<Message>(this.apiUrl, payload, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public findResult(session: string): Observable<VoteResult[]> {
    return this.http.get<VoteResult[]>(`${this.apiUrl}/${session}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }
}
