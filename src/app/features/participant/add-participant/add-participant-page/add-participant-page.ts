import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { ParticipantService } from "../../../../core/services/participant/participant.service";
import { CustomHeader } from "../../../../shared/components/headers/custom-header/custom-header";
import { CustomInput } from "../../../../shared/components/inputs/custom-input/custom-input";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../../shared/components/modals/modal/modal";
import { CustomButton } from "../../../../shared/components/buttons/custom-button/custom-button";
import { ReactiveFormsModule } from "@angular/forms";
import { Group } from "../../../../core/models/group";
import { ModalConfig } from "../../../../shared/interfaces/config/modal";
import { User } from "../../../../core/models/user";

@Component({
  selector: "app-add-participant-page",
  imports: [
    CustomHeader,
    CustomInput,
    CustomButton,
    Loading,
    Modal,
    ReactiveFormsModule,
  ],
  templateUrl: "./add-participant-page.html",
  styleUrl: "./add-participant-page.scss",
})
export class AddParticipantPage implements OnInit {
  public isLoading = false;
  public currentGroups: Group[] = [];
  public createForm!: FormGroup;

  public modalConfig!: ModalConfig;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private fb = inject(FormBuilder);

  public ngOnInit(): void {
    this.createForm = this.fb.group({
      name: ["", Validators.required],
      group: ["", Validators.required],
    });

    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public create(): void {
    if (this.createForm.get("name")!.invalid)
      return document.getElementById("create-name-input")?.focus();

    if (this.createForm.get("group")!.value == "") {
      this.modalConfig = {
        isVisible: true,
        icon: "",
        title: "ERRO",
        children: "Escolha um grupo para esse participante",
        onClose: (): void => {
          this.modalConfig.isVisible = false;
        },
      };
      return;
    }
    this.isLoading = true;
    this.participantService.create(this.createForm.value).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          icon: "",
          title: "SUCESSO",
          children: result.message,
          onClose: (): void => {
            this.createForm.reset({ name: "", group: "" });
            this.modalConfig.isVisible = false;
          },
        };
      },
      error: (error) => {
        this.modalConfig = {
          isVisible: true,
          icon: "",
          title: "ERRO",
          children: error.message,
          onClose: (): void => {
            this.modalConfig.isVisible = false;
          },
        };
      },
      complete: () => (this.isLoading = false),
    });
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    this.loadData();
  }

  private loadData(): void {
    if (!this._currentUser) return;
    this.isLoading = true;
    this.groupService.findAllWithoutSubGroups(this._currentUser._id).subscribe({
      next: (groups) => {
        this.currentGroups = groups;
        this.isLoading = false;
      },
    });
  }
}
