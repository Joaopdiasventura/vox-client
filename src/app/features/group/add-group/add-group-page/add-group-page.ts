import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { CreateGroupDto } from "../../../../shared/dto/group/create-group.dto";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { Modal } from "../../../../shared/components/modals/modal/modal";
import { CustomInput } from "../../../../shared/components/inputs/custom-input/custom-input";
import { CustomHeader } from "../../../../shared/components/headers/custom-header/custom-header";
import { CustomButton } from "../../../../shared/components/buttons/custom-button/custom-button";
import { ReactiveFormsModule } from "@angular/forms";
import { User } from "../../../../core/models/user";
import { ModalConfig } from "../../../../shared/interfaces/config/modal";
import { CustomSelect } from "../../../../shared/components/selects/custom-select/custom-select";
import { SelectOption } from "../../../../shared/interfaces/config/select";

@Component({
  selector: "app-add-group-page",
  imports: [
    Loading,
    Modal,
    CustomInput,
    CustomHeader,
    CustomButton,
    CustomSelect,
    ReactiveFormsModule,
  ],
  templateUrl: "./add-group-page.html",
  styleUrl: "./add-group-page.scss",
})
export class AddGroupPage implements OnInit {
  public isLoading = false;
  public currentGroups: SelectOption[] = [];

  public createForm!: FormGroup;

  public modalConfig!: ModalConfig;

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private fb = inject(FormBuilder);

  public ngOnInit(): void {
    this.createForm = this.fb.group({
      name: ["", Validators.required],
      group: [null],
    });

    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public create(): void {
    if (!this._currentUser) return;

    if (this.createForm.invalid) {
      const el = this.createForm.get("name")!.invalid
        ? "create-name-input"
        : null;
      if (el) document.getElementById(el)?.focus();
      return;
    }

    this.isLoading = true;

    const dto: CreateGroupDto = {
      name: this.createForm.value.name,
      user: this._currentUser._id,
    };

    if (this.createForm.value.group != "null")
      dto.group = this.createForm.value.group;

    this.groupService.create(dto).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          icon: "svg/white/check-icon.svg",
          title: "SUCESSO",
          children: result.message,
          onClose: (): void => {
            this.createForm.reset({ name: "", group: null });
            this.modalConfig.isVisible = false;
          },
        };
        this.findGroups();
      },
      error: (err) => {
        this.modalConfig = {
          isVisible: true,
          icon: "svg/white/warn-icon.svg",
          title: "ERRO",
          children: err.message,
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
    this.findGroups();
  }

  private findGroups(): void {
    if (!this._currentUser) return;
    this.isLoading = true;
    this.groupService
      .findAllWithoutParticipants(this._currentUser._id)
      .subscribe({
        next: (groups) =>
          (this.currentGroups = groups.map((g) => ({
            value: g._id,
            label: (g.group ? g.group + "/" : "") + g.name,
          }))),
        complete: () => (this.isLoading = false),
      });
  }
}
