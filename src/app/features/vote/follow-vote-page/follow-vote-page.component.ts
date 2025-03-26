import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { User } from '../../../core/models/user';
import { Socket } from 'socket.io-client';
import { Group } from '../../../core/models/group';
import { VoteResult } from '../../../shared/interfaces/vote-result';
import { GroupService } from '../../../core/services/group/group.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { WebSocketService } from '../../../core/services/web-socket/web-socket.service';
@Component({
  selector: 'app-follow-vote-page',
  imports: [LoadingComponent, HeaderComponent, FormsModule],
  templateUrl: './follow-vote-page.component.html',
  styleUrl: './follow-vote-page.component.scss',
})
export class FollowVotePageComponent implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public currentUser: User | null = null;
  public currentGroups: Group[] = [];
  public selectedGroup: Group | null = null;
  public voteResult!: VoteResult;

  private socket!: Socket;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((result) => this.handleUserConnection(result));
  }

  public ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  private handleUserConnection(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.isLoading = true;
    this.connectToWebSocket();
    this.findGroups(user._id);
  }

  private connectToWebSocket() {
    this.socket = this.webSocketService.connect();
  }

  private findGroups(user: string) {
    this.groupService.findAllWithParticipants(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }

  public changeSelect(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.isLoading = true;
    this.selectedGroup = group;
    this.socket.on(`vote-${group._id}`, (payload) =>
      this.changeTable(payload.participant)
    );
    this.groupService.getResult(group._id).subscribe({
      next: (result) => (this.voteResult = result),
      complete: () => (this.isLoading = false),
    });
  }

  public changeTable(participant: string) {
    const index = this.voteResult.participants.findIndex(
      (p) => p._id == participant
    );
    if (index >= 0) this.voteResult.participants[index].votes += 1;
    this.voteResult.participants.sort((a, b) => b.votes - a.votes);
  }
}
