import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { User } from '../../../core/models/user';
import { Socket } from 'socket.io-client';
import { Group } from '../../../core/models/group';
import { VoteResult } from '../../../shared/interfaces/vote-result';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GroupService } from '../../../core/services/group.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-follow-vote-page',
  imports: [
    LoadingComponent,
    HeaderComponent,
    AccessInputComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './follow-vote-page.component.html',
  styleUrl: './follow-vote-page.component.scss',
})
export class FollowVotePageComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public currentUser: User | null = null;
  public currentGroups: Group[] = [];
  public selectedGroup!: Group;
  public voteResult!: VoteResult;

  public voteId: string = '';

  public urn: string = '';

  private socket!: Socket;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((result) => this.handleUserConnection(result));
  }

  private handleUserConnection(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.connectToWebSocket();
    this.findGroups(user._id);
  }

  public ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
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
    this.socket.on(`vote-${group._id}`, (payload) =>
      this.changeTable(payload.participant)
    );
    this.selectedGroup = group;
    this.groupService.getResult(group._id).subscribe({
      next: (result) => (this.voteResult = result),
    });
  }

  public changeTable(participant: string) {
    const index = this.voteResult.participants.findIndex(
      (p) => p._id == participant
    );
    if (index >= 0) this.voteResult.participants[index].votes += 1;
    this.voteResult.participants.sort((a, b) => b.votes - a.votes);
  }

  public allowVote() {
    this.socket.emit('allow-vote', this.urn);
  }
}
