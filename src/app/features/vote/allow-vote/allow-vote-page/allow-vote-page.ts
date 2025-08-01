import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { Group } from "../../../../core/models/group";
import { User } from "../../../../core/models/user";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { WebSocketService } from "../../../../core/services/web-socket/web-socket.service";
import { CustomButton } from "../../../../shared/components/buttons/custom-button/custom-button";
import { CustomHeader } from "../../../../shared/components/headers/custom-header/custom-header";
import { CustomInput } from "../../../../shared/components/inputs/custom-input/custom-input";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../../shared/components/modals/modal/modal";
import { ModalConfig } from "../../../../shared/interfaces/config/modal";
import { SelectOption } from "../../../../shared/interfaces/config/select";
import { CustomSelect } from "../../../../shared/components/selects/custom-select/custom-select";

@Component({
  selector: "app-allow-vote-page",
  imports: [
    CustomHeader,
    Loading,
    Modal,
    CustomInput,
    CustomButton,
    ReactiveFormsModule,
    CustomSelect,
  ],
  templateUrl: "./allow-vote-page.html",
  styleUrl: "./allow-vote-page.scss",
})
export class AllowVotePage implements OnInit, OnDestroy {
  public isLoading = false;
  public currentGroups: SelectOption[] = [];
  public selectedGroup!: Group;
  public modalConfig!: ModalConfig;
  public urnForm!: FormGroup;
  public selectForm!: FormGroup;

  private _currentUser: User | null = null;
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private sub!: Subscription;

  public ngOnInit(): void {
    this.urnForm = this.fb.group({
      urn: [""],
    });

    this.selectForm = this.fb.group({
      group: [null],
    });

    this.selectForm
      .get("group")!
      .valueChanges.subscribe((v) => this.changeSelect(v));

    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();
    this.sub = init$.subscribe((user) => this.handleUserConnection(user));
  }

  public ngOnDestroy(): void {
    this.webSocketService.close();
    this.sub.unsubscribe();
  }

  public changeSelect(groupId: string): void {
    const group = this.currentGroups.find((g) => g.value == groupId);
    if (!group) return;
    this.webSocketService.on(`vote-${group.value}`, () => this.alertVote());
  }

  public allowVote(): void {
    const urnId = this.urnForm.value.urn;
    this.webSocketService.emit("allow-vote", urnId);
  }

  public exitVote(): void {
    this.webSocketService.emit("exit-vote", this.selectedGroup._id);
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    this.webSocketService.open(user.email);
    this.loadData();
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

  private alertVote(): void {
    this.modalConfig = {
      isVisible: true,
      icon: "svg/white/check-icon.svg",
      title: "VOTO REALIZADO",
      children: "Urna bloqueada até receber uma autorização",
      onClose: (): void => {
        this.modalConfig.isVisible = false;
      },
    };
  }
}
