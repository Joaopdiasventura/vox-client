import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { GroupService } from '../../../core/services/group/group.service';
import { WebSocketService } from '../../../core/services/web-socket/web-socket.service';
import { User } from '../../../core/models/user';
import { Socket } from 'socket.io-client';
import { Group } from '../../../core/models/group';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';

@Component({
  selector: 'app-allow-vote-page',
  imports: [
    LoadingComponent,
    ModalComponent,
    HeaderComponent,
    AccessInputComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './allow-vote-page.component.html',
  styleUrl: './allow-vote-page.component.scss',
})
export class AllowVotePageComponent implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public urnId: string = '';

  public currentUser: User | null = null;
  public currentGroups: Group[] = [];
  public selectedGroup!: Group;

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private socket!: Socket;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((result) => this.handleUserconnection(result));
  }

  public ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  public changeSelect(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.socket.on(`vote-${group._id}`, () => this.alertVote());
  }

  public allowVote() {
    this.socket.emit('allow-vote', this.urnId);
  }

  private handleUserconnection(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.isLoading = true;
    this.connnectToWebSocket();
    this.findGroups(user._id);
  }

  private connnectToWebSocket() {
    this.socket = this.webSocketService.connect();
  }

  private findGroups(user: string) {
    this.groupService.findAllWithParticipants(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }

  private alertVote() {
    this.modalConfig = {
      isVisible: true,
      title: 'VOTO REALIZADO',
      children: 'Urna bloqueada até ter uma autorização',
      onClose: () => (this.modalConfig.isVisible = false),
    };
  }
}
