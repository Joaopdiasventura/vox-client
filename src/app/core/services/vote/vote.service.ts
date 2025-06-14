import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CreateVoteDto } from "../../../shared/dto/vote/create-vote.dto";
import { Message } from "../../../shared/interfaces/messages/message";
import { Observable } from "rxjs";

declare const API_URL: string;

@Injectable({
  providedIn: "root",
})
export class VoteService {
  private apiUrl = API_URL + "/vote";
  private http = inject(HttpClient);

  public create(createVoteDto: CreateVoteDto): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, createVoteDto, {
      headers: { Authorization: localStorage.getItem("token") as string },
    });
  }
}
