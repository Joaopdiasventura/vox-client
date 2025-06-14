import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { of, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { Group } from "../../../../core/models/group";
import { User } from "../../../../core/models/user";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { WebSocketService } from "../../../../core/services/web-socket/web-socket.service";
import { CustomButton } from "../../../../shared/components/custom-button/custom-button";
import { CustomHeader } from "../../../../shared/components/custom-header/custom-header";
import { CustomInput } from "../../../../shared/components/custom-input/custom-input";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../../shared/components/modals/modal/modal";
import { ModalConfig } from "../../../../shared/interfaces/config/modal";

@Component({
  selector: "app-allow-vote-page",
  imports: [
    CustomHeader,
    Loading,
    Modal,
    CustomInput,
    CustomButton,
    ReactiveFormsModule,
  ],
  templateUrl: "./allow-vote-page.html",
  styleUrl: "./allow-vote-page.scss",
})
export class AllowVotePage implements OnInit, OnDestroy {
  public isLoading = false;
  public currentGroups: Group[] = [];
  public selectedGroup!: Group;
  public modalConfig!: ModalConfig;
  public form!: FormGroup;

  private _currentUser: User | null = null;
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private webSocketService = inject(WebSocketService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private sub!: Subscription;

  public ngOnInit(): void {
    this.form = this.fb.group({
      urn: [""],
    });
    const init$ = this.authService.currentUserData
      ? of(this.authService.currentUserData)
      : this.authService.connectUser();
    this.sub = init$.subscribe((user) => this.handleUserConnection(user));
  }

  public ngOnDestroy(): void {
    this.webSocketService.close();
    this.sub.unsubscribe();
  }

  public changeSelect(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == select.value);
    if (!group) return;
    this.selectedGroup = group;
    this.webSocketService.on(`vote-${group._id}`, () => this.alertVote());
  }

  public allowVote(): void {
    const urnId = this.form.value.urn;
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
      next: (groups) => {
        if (groups.length == 0) this.router.navigate(["group", "add"]);
        this.currentGroups = groups;
      },
      complete: () => (this.isLoading = false),
    });
  }

  private alertVote(): void {
    this.modalConfig = {
      isVisible: true,
      title: "VOTO REALIZADO",
      children: "Urna bloqueada até receber uma autorização",
      onClose: (): void => {
        this.modalConfig.isVisible = false;
      },
    };
  }
}
