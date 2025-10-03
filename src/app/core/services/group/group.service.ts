import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Group } from '../../models/group';
import { FindGroupDto } from '../../../shared/dto/group/find-group.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly apiUrl = API_URL + '/group';
  private readonly http = inject(HttpClient);

  private readonly token = localStorage.getItem('token')!;

  public findMany(user: string, findGroupDto: FindGroupDto): Observable<Group[]> {
    const params = new HttpParams({ fromObject: { ...findGroupDto } });
    return this.http.get<Group[]>(`${this.apiUrl}/findMany/${user}`, {
      params,
      headers: { authorization: this.token },
    });
  }
}
