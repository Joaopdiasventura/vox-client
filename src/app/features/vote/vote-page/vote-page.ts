import { ModalQuestion } from "./../../../shared/components/modals/modal-question/modal-question";
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Participant } from "../../../core/models/participant";
import { User } from "../../../core/models/user";
import { AuthService } from "../../../core/services/auth/auth.service";
import { GroupService } from "../../../core/services/group/group.service";
import { ParticipantService } from "../../../core/services/participant/participant.service";
import { VoteService } from "../../../core/services/vote/vote.service";
import { WebSocketService } from "../../../core/services/web-socket/web-socket.service";
import { CreateVoteDto } from "../../../shared/dto/vote/create-vote.dto";
import { VoteStatus } from "../../../shared/types/vote-status";
import {
  ModalConfig,
  QuestionModalConfig,
} from "../../../shared/interfaces/config/modal";
import { CustomHeader } from "../../../shared/components/headers/custom-header/custom-header";
import { CustomButton } from "../../../shared/components/buttons/custom-button/custom-button";
import { Loading } from "../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../shared/components/modals/modal/modal";
import { Router } from "@angular/router";
import { SelectOption } from "../../../shared/interfaces/config/select";
import { CustomSelect } from "../../../shared/components/selects/custom-select/custom-select";

@Component({
  selector: "app-vote-page",
  imports: [
    CustomHeader,
    CustomButton,
    Loading,
    Modal,
    ModalQuestion,
    CustomSelect,
  ],
  templateUrl: "./vote-page.html",
  styleUrl: "./vote-page.scss",
})
export class VotePage implements OnInit, OnDestroy {
  public isLoading = false;
  public currentGroups: SelectOption[] = [];

  public selectedGroup: SelectOption | null = null;
  public selectedParticipant: string | null = null;

  public selectedParticipants: Participant[] = [];

  public simpleId = "";
  public status: VoteStatus = "selecting";
  public nullVote = true;

  public currentVote!: CreateVoteDto;

  public modalConfig!: ModalConfig;
  public questionModalConfig!: QuestionModalConfig;

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
    const { value } = e.target as HTMLSelectElement;
    this.selectedGroup =
      this.currentGroups.find((g) => g.value == value) || null;
    this.findParticipants(value);
    this.webSocketService.on("exit-" + value, () =>
      this.router.navigate(["access"]),
    );
  }

  public changeNullVote(): void {
    this.nullVote = !this.nullVote;
  }

  public startVote(): void {
    if (!this.selectedGroup && !this.selectedGroup) {
      this.modalConfig = {
        isVisible: true,
        icon: "svg/white/warn-icon.svg",
        title: "ERRO",
        children: "SELECIONE PELO MENOS UM GRUPO",
        onClose: (): void => {
          this.modalConfig.isVisible = false;
        },
      };
      this.modalConfig.isVisible = true;
      return;
    }
    this.status = "occurring";
  }

  public addVote(participant: string): void {
    this.currentVote = { participant };
    this.selectedParticipant =
      this.selectedParticipants.find((p) => p._id == participant)?.name ||
      "nulo";
  }

  public vote(): void {
    if (!this.selectedGroup) return;
    this.questionModalConfig = {
      isVisible: true,
      icon: "svg/white/check-icon.svg",
      title: "CONFIRMAR VOTO",
      children: `Você confirma seu voto para ${this.selectedParticipant}`,
      onConfirm: (): void => {
        this.webSocketService.emit(`send-vote`, {
          ...this.currentVote,
          group: this.selectedGroup?.value,
        });

        if (this.currentVote.participant != "null")
          this.voteService.create(this.currentVote).subscribe();

        this.status = "blocked";
        this.questionModalConfig.isVisible = false;
      },
      onDeny: (): void => {
        this.questionModalConfig.isVisible = false;
      },
    };
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
        this.currentGroups = result.map((g) => ({
          value: g._id,
          label: (g.group ? g.group + "/" : "") + g.name,
        }));
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
