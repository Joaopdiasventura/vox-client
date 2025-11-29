import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateCandidateDto } from '../../../shared/dto/candidate/create-candidate.dto';
import { Observable } from 'rxjs';
import { Message } from '../../../shared/interfaces/messages';
import { FindCandidateDto } from '../../../shared/dto/candidate/find-candidate.dto';
import { Candidate } from '../../models/candidate';
import { UpdateCandidateDto } from '../../../shared/dto/candidate/update-candidate.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private readonly apiUrl = API_URL + '/candidate';
  private readonly http = inject(HttpClient);

  public create(createCandidateDto: CreateCandidateDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, createCandidateDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public findMany(findCandidateDto: FindCandidateDto): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl, {
      headers: { authorization: localStorage.getItem('token')! },
      params: Object.fromEntries(
        Object.entries(findCandidateDto)
          .filter(([, v]) => v != undefined && v != null && v != '')
          .map(([k, v]) => [k, String(v)]),
      ),
    });
  }

  public findById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Observable<Message> {
    return this.http.patch<Message>(
      `${this.apiUrl}/${id}`,
      updateCandidateDto,
      {
        headers: { authorization: localStorage.getItem('token')! },
      },
    );
  }

  public delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }
}
