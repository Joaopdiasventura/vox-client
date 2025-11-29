import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Session } from '../../../../core/models/session';
import { DatePipe } from '@angular/common';
import { SessionService } from '../../../../core/services/session/session.service';
import { CustomButtonComponent } from '../../custom/custom-button/custom-button.component';
import { CustomLinkComponent } from '../../custom/custom-link/custom-link.component';
import { UiStateService } from '../../../services/ui-state/ui-state.service';

@Component({
  selector: 'session-card',
  imports: [DatePipe, CustomButtonComponent, CustomLinkComponent],
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent {
  @Input({ required: true }) public session!: Session;
  @Input({ required: true }) public index!: number;
  @Input({ required: false }) public expand!: boolean;

  @Output() public changeLoading = new EventEmitter<boolean>();
  @Output() public deleteEvent = new EventEmitter<number>();

  private readonly sessionService = inject(SessionService);
  private readonly uiStateService = inject(UiStateService);

  public get electionNames(): string {
    return this.sessionService.getElectionNames(this.session.elections);
  }

  public openModal(): void {
    this.uiStateService.setModalConfig({
      icon: 'white/sucess',
      title: 'Confirme',
      message: `Deseja deletar a sessão com as eleições ${this.electionNames}`,
      onClose: () => {
        this.uiStateService.setModalConfig(null);
        this.delete();
      },
      onDeny: () => this.uiStateService.setModalConfig(null),
    });
  }

  public delete(): void {
    this.changeLoading.emit(true);
    this.sessionService.delete(this.session._id).subscribe({
      next: ({ message }) => {
        this.deleteEvent.emit(this.index);
        this.changeLoading.emit(false);
        this.uiStateService.setModalConfig({
          icon: 'white/sucess',
          title: 'Sucesso',
          message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
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
}
