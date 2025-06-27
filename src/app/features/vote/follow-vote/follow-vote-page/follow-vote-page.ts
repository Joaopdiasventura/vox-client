import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { User } from "../../../../core/models/user";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { WebSocketService } from "../../../../core/services/web-socket/web-socket.service";
import { VoteResult } from "../../../../shared/interfaces/results/vote";
import { CustomHeader } from "../../../../shared/components/headers/custom-header/custom-header";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Router } from "@angular/router";
import { SelectOption } from "../../../../shared/interfaces/config/select";
import { CustomSelect } from "../../../../shared/components/selects/custom-select/custom-select";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-follow-vote-page",
  imports: [CustomHeader, Loading, CustomSelect, ReactiveFormsModule],
  templateUrl: "./follow-vote-page.html",
  styleUrl: "./follow-vote-page.scss",
})
export class FollowVotePage implements OnInit, OnDestroy {
  public isLoading = false;
  public currentGroups: SelectOption[] = [];
  public selectedGroup: string | null = null;
  public voteResult!: VoteResult;
  public selectForm!: FormGroup;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public ngOnInit(): void {
    this.selectForm = this.fb.group({
      group: [null, Validators.required],
    });

    this.selectForm
      .get("group")!
      .valueChanges.subscribe((v) => this.changeSelect(v));

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
        this.currentGroups = result.map((g) => ({
          value: g._id,
          label: (g.group ? g.group + "/" : "") + g.name,
        }));
      },
      complete: () => (this.isLoading = false),
    });
  }

  public changeSelect(groupId: string): void {
    const group = this.currentGroups.find((g) => g.value == groupId);

    if (!group) return;
    this.isLoading = true;
    this.webSocketService.on(`vote-${group.value}`, (payload) =>
      this.changeTable(payload.participant),
    );
    this.groupService.getResult(group.value).subscribe({
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
