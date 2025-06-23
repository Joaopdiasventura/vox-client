import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Group } from "../../../core/models/group";
import { Participant } from "../../../core/models/participant";
import { User } from "../../../core/models/user";
import { AuthService } from "../../../core/services/auth/auth.service";
import { GroupService } from "../../../core/services/group/group.service";
import { ParticipantService } from "../../../core/services/participant/participant.service";
import { VoteService } from "../../../core/services/vote/vote.service";
import { WebSocketService } from "../../../core/services/web-socket/web-socket.service";
import { CreateVoteDto } from "../../../shared/dto/vote/create-vote.dto";
import { VoteStatus } from "../../../shared/types/vote-status";
import { ModalConfig } from "../../../shared/interfaces/config/modal";
import { CustomHeader } from "../../../shared/components/headers/custom-header/custom-header";
import { CustomButton } from "../../../shared/components/buttons/custom-button/custom-button";
import { Loading } from "../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../shared/components/modals/modal/modal";
import { Router } from "@angular/router";

@Component({
  selector: "app-vote-page",
  imports: [CustomHeader, CustomButton, Loading, Modal],
  templateUrl: "./vote-page.html",
  styleUrl: "./vote-page.scss",
})
export class VotePage implements OnInit, OnDestroy {
  public isLoading = false;
  public currentGroups: Group[] = [];

  public selectedGroup: Group | null = null;
  public selectedParticipants: Participant[] = [];

  public simpleId = "";
  public status: VoteStatus = "selecting";
  public nullVote = true;

  public currentVote!: CreateVoteDto;

  public modalConfig!: ModalConfig;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);
  private voteService = inject(VoteService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private router = inject(Router);

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key == "F11" || event.key == "F4" || event.key == "Tab")
      event.preventDefault();
  }

  public ngOnInit(): void {
    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public ngOnDestroy(): void {
    this.webSocketService.close();
  }

  public changeSelect(e: Event): void {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.selectedGroup = group;
    this.findParticipants(this.selectedGroup._id);
    this.webSocketService.on("exit-" + this.selectedGroup._id, () =>
      this.router.navigate(["access"]),
    );
  }

  public changeNullVote(): void {
    this.nullVote = !this.nullVote;
  }

  public startVote(): void {
    if (!this.selectedGroup && !this.selectedGroup) {
      this.modalConfig.children = "SELECIONE PELO MENOS UM GRUPO";
      this.modalConfig.onClose = (): void => {
        this.modalConfig.isVisible = false;
      };
      this.modalConfig.isVisible = true;
      return;
    }
    this.status = "occurring";
  }

  public addVote(participant: string): void {
    this.currentVote = { participant };
  }

  public vote(): void {
    if (!this.selectedGroup) return;
    this.webSocketService.emit(`send-vote`, {
      ...this.currentVote,
      group: this.selectedGroup._id,
    });

    if (this.currentVote.participant != "null")
      this.voteService.create(this.currentVote).subscribe();

    this.status = "blocked";
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    this.connectToWebSocket();
    this.loadData();
  }

  private connectToWebSocket(): void {
    this.webSocketService.open();
    this.webSocketService.on("new-id", (payload) => (this.simpleId = payload));
    this.webSocketService.on("vote-allowed", () => {
      if (this.status == "blocked") this.status = "occurring";
    });
  }

  private loadData(): void {
    if (!this._currentUser) return;
    this.groupService.findAllWithParticipants(this._currentUser._id).subscribe({
      next: (result) => {
        if (result.length == 0) this.router.navigate(["group", "add"]);
        this.currentGroups = result;
      },
      complete: () => (this.isLoading = false),
    });
  }

  private findParticipants(group: string): void {
    this.participantService.findAllByGroup(group).subscribe({
      next: (result) => (this.selectedParticipants = result),
    });
  }
}
