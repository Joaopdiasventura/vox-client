import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CreateGroupDto } from "../../../shared/dto/group/create-group.dto";
import { Message } from "../../../shared/interfaces/messages/message";
import { Group } from "../../models/group";
import { Observable } from "rxjs";
import { VoteResult } from "../../../shared/interfaces/results/vote";

declare const API_URL: string;

@Injectable({
  providedIn: "root",
})
export class GroupService {
  private apiUrl = API_URL + "/group";
  private http = inject(HttpClient);

  public create(createGroupDto: CreateGroupDto): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, createGroupDto, {
      headers: { Authorization: localStorage.getItem("token") as string },
    });
  }

  public findById(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`, {
      headers: { Authorization: localStorage.getItem("token") as string },
    });
  }

  public findManyByGroup(group: string, page: number): Observable<Group[]> {
    return this.http.get<Group[]>(
      `${this.apiUrl}/findManyByGroup/${group}/${page}`,
      {
        headers: { Authorization: localStorage.getItem("token") as string },
      },
    );
  }

  public findManyByUser(user: string, page: number): Observable<Group[]> {
    return this.http.get<Group[]>(
      `${this.apiUrl}/findManyByUser/${user}/${page}`,
      {
        headers: { Authorization: localStorage.getItem("token") as string },
      },
    );
  }

  public findAllWithoutSubGroups(user: string): Observable<Group[]> {
    return this.http.get<Group[]>(
      `${this.apiUrl}/findAllWithoutSubGroups/${user}`,
      {
        headers: { Authorization: localStorage.getItem("token") as string },
      },
    );
  }

  public findAllWithoutParticipants(user: string): Observable<Group[]> {
    return this.http.get<Group[]>(
      `${this.apiUrl}/findAllWithoutParticipants/${user}`,
      {
        headers: { Authorization: localStorage.getItem("token") as string },
      },
    );
  }

  public findAllWithParticipants(user: string): Observable<Group[]> {
    return this.http.get<Group[]>(
      `${this.apiUrl}/findAllWithParticipants/${user}`,
      {
        headers: { Authorization: localStorage.getItem("token") as string },
      },
    );
  }

  public getResult(group: string): Observable<VoteResult> {
    return this.http.get<VoteResult>(`${this.apiUrl}/getResult/${group}`, {
      headers: { Authorization: localStorage.getItem("token") as string },
    });
  }

  public delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: { Authorization: localStorage.getItem("token") as string },
    });
  }
}
