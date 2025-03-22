import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { User } from '../../../core/models/user';
import { Group } from '../../../core/models/group';
import { Participant } from '../../../core/models/participant';
import { Router } from '@angular/router';
import { VoteStatus } from '../../../shared/types/vote-status.type';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Socket } from 'socket.io-client';
import { FormsModule } from '@angular/forms';
import { CreateVoteDto } from '../../../shared/dto/vote/create-vote.dto';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { WebSocketService } from '../../../core/services/web-socket/web-socket.service';
import { GroupService } from '../../../core/services/group/group.service';
import { ParticipantService } from '../../../core/services/participant/participant.service';
import { VoteService } from '../../../core/services/vote/vote.service';

@Component({
  selector: 'app-start-vote-page',
  imports: [
    LoadingComponent,
    HeaderComponent,
    ModalComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './start-vote-page.component.html',
  styleUrl: './start-vote-page.component.scss',
})
export class StartVotePageComponent implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public currentUser: User | null = null;
  public currentGroups: Group[] = [];

  public selectedGroups: Group[] = [];
  public selectedParticipants: Participant[] = [];

  public simpleId: string = '';
  public status: VoteStatus = 'selecting';

  public votes: CreateVoteDto[] = [];

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private socket!: Socket;

  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);
  private voteService = inject(VoteService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private router = inject(Router);

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'F11' || event.key == 'F4' || event.key == 'Tab')
      event.preventDefault();
  }

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((result) => this.handleUserConnection(result));
  }

  public ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  public changeSelect(e: Event, position: 0 | 1) {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.selectedGroups[position] = group;
    this.findParticipants(this.selectedGroups[position]._id);
  }

  public startVote() {
    if (!this.selectedGroups[0] && !this.selectedGroups[1]) {
      this.modalConfig.children = 'SELECIONE PELO MENOS UM GRUPO';
      this.modalConfig.onClose = () => (this.modalConfig.isVisible = false);
      this.modalConfig.isVisible = true;
      return;
    }
    this.status = 'occurring';
  }

  public addVote(position: 0 | 1, participant: string) {
    this.votes[position] = { participant };
  }

  public vote() {
    for (let i = 0; i < this.votes.length; i++) {
      this.socket.emit(`send-vote`, {
        ...this.votes[i],
        group: this.selectedGroups[i]._id,
      });
      if (this.votes[i].participant != 'null')
        this.voteService.create(this.votes[i]).subscribe();
    }
    this.status = 'blocked';
  }

  public logOut() {
    this.authService.disconnectUser();
    this.router.navigate(['access']);
  }

  private handleUserConnection(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.connectToWebSocket();
    this.findGroups(user._id);
  }

  private connectToWebSocket() {
    this.socket = this.webSocketService.connect();
    this.socket.on('new-id', (payload) => (this.simpleId = payload));
    this.socket.on('vote-allowed', () => {
      if (this.status == 'blocked') this.status = 'occurring';
    });
  }

  private findGroups(user: string) {
    this.groupService.findAllWithParticipants(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }

  private findParticipants(group: string) {
    this.participantService.findAllByGroup(group).subscribe({
      next: (result) => (this.selectedParticipants = result),
    });
  }
}
