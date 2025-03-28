import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateGroupDto } from '../../../shared/dto/group/create-group.dto';
import { Message } from '../../../shared/interfaces/message';
import { VoteResult } from '../../../shared/interfaces/vote-result';
import { Group } from '../../models/group';

declare const API_URL: string;

@Injectable({ providedIn: 'root' })
export class GroupService {
  private apiUrl = API_URL + '/group';
  private http = inject(HttpClient);

  public create(createGroupDto: CreateGroupDto) {
    const token = localStorage.getItem('token') as string;
    return this.http.post<Message>(`${this.apiUrl}`, createGroupDto, {
      headers: { Authorization: token },
    });
  }

  public findById(id: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Group>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  public findManyByGroup(group: string, page: number) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Group[]>(
      `${this.apiUrl}/findManyByGroup/${group}/${page}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public findManyByUser(user: string, page: number) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Group[]>(
      `${this.apiUrl}/findManyByUser/${user}/${page}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public findAllWithoutSubGroups(user: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Group[]>(
      `${this.apiUrl}/findAllWithoutSubGroups/${user}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public findAllWithoutParticipants(user: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Group[]>(
      `${this.apiUrl}/findAllWithoutParticipants/${user}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public findAllWithParticipants(user: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Group[]>(
      `${this.apiUrl}/findAllWithParticipants/${user}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public getResult(group: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<VoteResult>(`${this.apiUrl}/getResult/${group}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  public delete(id: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  }
}
