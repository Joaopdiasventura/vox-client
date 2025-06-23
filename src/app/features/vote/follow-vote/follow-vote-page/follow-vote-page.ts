import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Group } from "../../../../core/models/group";
import { User } from "../../../../core/models/user";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { WebSocketService } from "../../../../core/services/web-socket/web-socket.service";
import { VoteResult } from "../../../../shared/interfaces/results/vote";
import { CustomHeader } from "../../../../shared/components/headers/custom-header/custom-header";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Router } from "@angular/router";

@Component({
  selector: "app-follow-vote-page",
  imports: [CustomHeader, Loading],
  templateUrl: "./follow-vote-page.html",
  styleUrl: "./follow-vote-page.scss",
})
export class FollowVotePage implements OnInit, OnDestroy {
  public isLoading = false;
  public currentGroups: Group[] = [];
  public selectedGroup: Group | null = null;
  public voteResult!: VoteResult;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);
  private router = inject(Router);

  public ngOnInit(): void {
    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public ngOnDestroy(): void {
    this.webSocketService.close();
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    this.connectToWebSocket();
    this.loadData();
  }

  private connectToWebSocket(): void {
    this.webSocketService.open();
  }

  private loadData(): void {
    if (!this._currentUser) return;
    this.isLoading = true;
    this.groupService.findAllWithParticipants(this._currentUser._id).subscribe({
      next: (result) => {
        if (result.length == 0) this.router.navigate(["group", "add"]);
        this.currentGroups = result;
      },
      complete: () => (this.isLoading = false),
    });
  }

  public changeSelect(e: Event): void {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.isLoading = true;
    this.selectedGroup = group;
    console.log(group._id);
    this.webSocketService.on(`vote-${group._id}`, (payload) =>
      this.changeTable(payload.participant),
    );
    this.groupService.getResult(group._id).subscribe({
      next: (result) => (this.voteResult = result),
      complete: () => (this.isLoading = false),
    });
  }

  public changeTable(participant: string): void {
    const index = this.voteResult.participants.findIndex(
      (p) => p._id == participant,
    );
    if (index >= 0) this.voteResult.participants[index].votes += 1;
    this.voteResult.participants.sort((a, b) => b.votes - a.votes);
  }
}
