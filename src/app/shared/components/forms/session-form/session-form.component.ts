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
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Session } from '../../../../core/models/session';
import { SessionService } from '../../../../core/services/session/session.service';
import { CreateSessionDto } from '../../../dto/session/create-session.dto';
import { UpdateSessionDto } from '../../../dto/session/update-session.dto';
import { Message } from '../../../interfaces/messages';
import {
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import { CustomButtonComponent } from '../../custom/custom-button/custom-button.component';
import { Election } from '../../../../core/models/election';
import { UiStateService } from '../../../services/ui-state/ui-state.service';

@Component({
  selector: 'session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    CustomButtonComponent,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonSelect,
    IonSelectOption,
  ],
})
export class SessionFormComponent implements OnInit, OnChanges {
  @Input({ required: false }) public session: Session | null = null;
  @Input({ required: true }) public elections!: Election[];

  @Output() public changeLoading = new EventEmitter<boolean>();

  private readonly uiStateService = inject(UiStateService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  public form = this.fb.group({
    elections: [[] as string[], [Validators.required, Validators.minLength(1)]],
    startedAt: [this.toLocalString(new Date()), Validators.required],
    endedAt: [this.toLocalString(new Date()), Validators.required],
  });

  public ngOnInit(): void {
    if (this.session)
      this.form.patchValue({
        elections: this.session.elections.map((e) => e._id),
        startedAt: this.toLocalString(new Date(this.session.startedAt)),
        endedAt: this.toLocalString(new Date(this.session.endedAt)),
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']?.currentValue) {
      const e: Session = changes['session'].currentValue;
      if (e)
        this.form.patchValue({
          elections: e.elections.map((el) => el._id),
          startedAt: this.toLocalString(new Date(e.startedAt)),
          endedAt: this.toLocalString(new Date(e.endedAt)),
        });
    }
  }

  public onSubmit(): void {
    this.changeLoading.emit(true);
    const $action = this.session ? this.update() : this.create();
    $action.subscribe({
      next: ({ message }) => {
        this.changeLoading.emit(false);
        this.uiStateService.setModalConfig({
          icon: 'white/sucess',
          title: 'Sucesso',
          message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
            this.router.navigate(['/session']);
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

  public toLocalString(date: Date): string {
    const pad2 = (n: number): string => String(n).padStart(2, '0');
    const pad3 = (n: number): string => String(n).padStart(3, '0');

    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hours = pad2(date.getHours());
    const minutes = pad2(date.getMinutes());
    const seconds = pad2(date.getSeconds());
    const millis = pad3(date.getMilliseconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}`;
  }

  private create(): Observable<Message> {
    const createSessionDto = this.form.value as CreateSessionDto;
    return this.sessionService.create(createSessionDto);
  }

  private update(): Observable<Message> {
    return this.sessionService.update(
      this.session!._id,
      this.form.value as UpdateSessionDto,
    );
  }
}
