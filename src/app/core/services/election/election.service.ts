import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateElectionDto } from '../../../shared/dto/election/create-election.dto';
import { Observable } from 'rxjs';
import { Message } from '../../../shared/interfaces/messages';
import { FindElectionDto } from '../../../shared/dto/election/find-election.sto';
import { Election } from '../../models/election';
import { UpdateElectionDto } from '../../../shared/dto/election/update-election.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class ElectionService {
  private readonly apiUrl = API_URL + '/election';
  private readonly http = inject(HttpClient);

  public create(createElectionDto: CreateElectionDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, createElectionDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public findMany(findElectionDto: FindElectionDto): Observable<Election[]> {
    return this.http.get<Election[]>(this.apiUrl, {
      headers: { authorization: localStorage.getItem('token')! },
      params: Object.fromEntries(
        Object.entries(findElectionDto)
          .filter(([, v]) => v != undefined && v != null && v != '')
          .map(([k, v]) => [k, String(v)]),
      ),
    });
  }

  public findById(id: string): Observable<Election> {
    return this.http.get<Election>(`${this.apiUrl}/${id}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public update(
    id: string,
    updateElectionDto: UpdateElectionDto,
  ): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}`, updateElectionDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }
}
