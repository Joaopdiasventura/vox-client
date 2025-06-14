import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CreateParticipantDto } from "../../../shared/dto/participant/create-participant.dto";
import { Message } from "../../../shared/interfaces/messages/message";
import { Participant } from "../../models/participant";
import { Observable } from "rxjs";

declare const API_URL: string;

@Injectable({
  providedIn: "root",
})
export class ParticipantService {
  private apiUrl = API_URL + "/participant";
  private http = inject(HttpClient);

  public create(
    createParticipantDto: CreateParticipantDto,
  ): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, createParticipantDto, {
      headers: { Authorization: localStorage.getItem("token") as string },
    });
  }

  public findAllByGroup(group: string): Observable<Participant[]> {
    return this.http.get<Participant[]>(
      `${this.apiUrl}/findAllByGroup/${group}`,
      {
        headers: {
          Authorization: localStorage.getItem("token") as string,
        },
      },
    );
  }

  public findManyByGroup(
    group: string,
    page: number,
  ): Observable<Participant[]> {
    return this.http.get<Participant[]>(
      `${this.apiUrl}/findManyByGroup/${group}/${page}`,
      {
        headers: {
          Authorization: localStorage.getItem("token") as string,
        },
      },
    );
  }

  public delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token") as string,
      },
    });
  }
}
