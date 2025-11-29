import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Candidate } from '../../../../core/models/candidate';
import { Election } from '../../../../core/models/election';
import { UiStateService } from '../../../services/ui-state/ui-state.service';
import { CandidateService } from '../../../../core/services/candidate/candidate.service';
import { CreateCandidateDto } from '../../../dto/candidate/create-candidate.dto';
import { UpdateCandidateDto } from '../../../dto/candidate/update-candidate.dto';
import { Message } from '../../../interfaces/messages';
import {
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { CustomButtonComponent } from '../../custom/custom-button/custom-button.component';

@Component({
  selector: 'candidate-form',
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    CustomButtonComponent,
    IonInput,
    IonSelect,
    IonSelectOption,
  ],
})
export class CandidateFormComponent implements OnInit {
  @Input({ required: false }) public candidate: Candidate | null = null;
  @Input({ required: true }) public elections!: Election[];

  @Output() public changeLoading = new EventEmitter<boolean>();

  private readonly uiStateService = inject(UiStateService);
  private readonly candidateService = inject(CandidateService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group({
    election: ['', Validators.required],
    name: ['', Validators.required],
  });

  public ngOnInit(): void {
    if (this.candidate)
      this.form.patchValue({
        election: this.candidate.election._id,
        name: this.candidate.name,
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidate']?.currentValue) {
      const e: Candidate = changes['candidate'].currentValue;
      if (e)
        this.form.patchValue({
          election: e.election._id,
          name: e.name,
        });
    }
  }

  public onSubmit(): void {
    this.changeLoading.emit(true);
    const $action = this.candidate ? this.update() : this.create();
    const targetElectionId =
      this.form.value.election || this.candidate?.election._id;
    $action.subscribe({
      next: ({ message }) => {
        this.changeLoading.emit(false);
        this.resetForm();
        this.uiStateService.setModalConfig({
          icon: 'white/sucess',
          title: 'Sucesso',
          message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
            if (targetElectionId)
              this.router.navigate(['/candidate', targetElectionId]);
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
    const createCandidateDto = this.form.value as CreateCandidateDto;
    return this.candidateService.create(createCandidateDto);
  }

  private update(): Observable<Message> {
    return this.candidateService.update(
      this.candidate!._id,
      this.form.value as UpdateCandidateDto,
    );
  }

  private resetForm(): void {
    this.form.reset({
      election: '',
      name: '',
    });
  }
}
