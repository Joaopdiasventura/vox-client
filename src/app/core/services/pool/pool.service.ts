import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pool } from '../../models/pool';
import { FindPoolDto } from '../../../shared/dto/pool/find-pool.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  private readonly apiUrl = API_URL + '/pool';
  private readonly http = inject(HttpClient);

  private readonly token = localStorage.getItem('token')!;

  public findMany(user: string, findPoolDto: FindPoolDto): Observable<Pool[]> {
    const params = new HttpParams({ fromObject: { ...findPoolDto } });
    return this.http.get<Pool[]>(`${this.apiUrl}/findMany/${user}`, {
      params,
      headers: { authorization: this.token },
    });
  }
}
