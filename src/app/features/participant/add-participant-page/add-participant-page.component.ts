import { Component, inject, OnInit } from '@angular/core';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models/user';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Group } from '../../../core/models/group';
import { CreateParticipantDto } from '../../../shared/dto/participant/create-participant.dto';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GroupService } from '../../../core/services/group/group.service';
import { ParticipantService } from '../../../core/services/participant/participant.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';

@Component({
  selector: 'app-add-participant-page',
  imports: [
    LoadingComponent,
    ModalComponent,
    AccessInputComponent,
    HeaderComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './add-participant-page.component.html',
  styleUrl: './add-participant-page.component.scss',
})
export class AddParticipantPageComponent implements OnInit {
  public isLoading: boolean = false;
  public currentUser: User | null = null;
  public currentGroups: Group[] = [];

  public createParticipant: CreateParticipantDto = {
    name: '',
    group: 'null',
  };

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((result) => this.handleUserConnection(result));
  }

  public create() {
    if (this.createParticipant.name.length == 0) {
      document.getElementById('create-name-input')?.focus();
      return;
    }

    if (this.createParticipant.group == 'null') {
      this.modalConfig = {
        title: 'ERRO',
        children: 'Escolha um grupo para esse participante',
        onClose: () => (this.modalConfig.isVisible = false),
        isVisible: true,
      };
      return;
    }

    this.isLoading = true;
    this.participantService.create(this.createParticipant).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          title: 'SUCESSO',
          children: result.message,
          onClose: () => {
            this.createParticipant = {
              name: '',
              group: '',
            };
            this.modalConfig.isVisible = false;
          },
        };
      },
      error: (error) => {
        this.modalConfig = {
          isVisible: true,
          title: 'ERRO',
          children: error.message,
          onClose: () => (this.modalConfig.isVisible = false),
        };
      },
      complete: () => (this.isLoading = false),
    });
  }

  public changeSelect(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    this.createParticipant.group = selectElement.value;
  }

  private handleUserConnection(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.findGroups(user._id);
  }

  private findGroups(user: string) {
    this.isLoading = true;
    this.groupService.findAllWithoutSubGroups(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }
}
