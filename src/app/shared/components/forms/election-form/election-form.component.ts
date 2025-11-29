import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Election } from '../../../../core/models/election';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/user/auth/auth.service';
import { User } from '../../../../core/models/user';
import { ElectionService } from '../../../../core/services/election/election.service';
import { CreateElectionDto } from '../../../dto/election/create-election.dto';
import { IonInput } from '@ionic/angular/standalone';
import { CustomButtonComponent } from '../../custom/custom-button/custom-button.component';
import { Observable } from 'rxjs';
import { Message } from '../../../interfaces/messages';
import { UpdateElectionDto } from '../../../dto/election/update-election.dto';
import { Router } from '@angular/router';
import { UiStateService } from '../../../services/ui-state/ui-state.service';

@Component({
  selector: 'election-form',
  templateUrl: './election-form.component.html',
  styleUrls: ['./election-form.component.scss'],
  imports: [ReactiveFormsModule, CustomButtonComponent, IonInput],
})
export class ElectionFormComponent implements OnInit, OnChanges {
  @Input({ required: false }) public election: Election | null = null;

  @Output() public changeLoading = new EventEmitter<boolean>();

  private user: User | null = null;

  private readonly uiStateService = inject(UiStateService);
  private readonly electionService = inject(ElectionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group({
    name: ['', Validators.required],
    user: [''],
  });

  public ngOnInit(): void {
    this.authService.user$.subscribe((u) => (this.user = u));
    if (this.election) this.form.patchValue({ name: this.election.name });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['election']?.currentValue) {
      const e: Election = changes['election'].currentValue;
      if (e) this.form.patchValue({ name: e.name });
    }
  }

  public onSubmit(): void {
    this.changeLoading.emit(true);
    const $action = this.election ? this.update() : this.create();
    $action.subscribe({
      next: ({ message }) => {
        this.changeLoading.emit(false);
        this.uiStateService.setModalConfig({
          icon: 'white/sucess',
          title: 'Sucesso',
          message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
            this.router.navigate(['/election']);
          },
        });
      },
      error: ({ error }) => {
        this.changeLoading.emit(false);
        this.uiStateService.setModalConfig({
          icon: 'white/error',
          title: 'Ops! Algo está errado',
          message: error.message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
          },
        });
      },
    });
  }

  private create(): Observable<Message> {
    const createElectionDto = this.form.value as CreateElectionDto;
    createElectionDto.user = this.user!._id;
    return this.electionService.create(createElectionDto);
  }

  private update(): Observable<Message> {
    return this.electionService.update(
      this.election!._id,
      this.form.value as UpdateElectionDto,
    );
  }
}
