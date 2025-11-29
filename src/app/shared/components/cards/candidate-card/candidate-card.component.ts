import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Candidate } from '../../../../core/models/candidate';
import { CandidateService } from '../../../../core/services/candidate/candidate.service';
import { CustomLinkComponent } from '../../custom/custom-link/custom-link.component';
import { CustomButtonComponent } from '../../custom/custom-button/custom-button.component';
import { UiStateService } from '../../../services/ui-state/ui-state.service';

@Component({
  selector: 'candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  imports: [CustomLinkComponent, CustomButtonComponent],
})
export class CandidateCardComponent {
  @Input({ required: true }) public candidate!: Candidate;

  @Input({ required: true }) public index!: number;

  @Output() public changeLoading = new EventEmitter<boolean>();
  @Output() public deleteEvent = new EventEmitter<number>();

  private readonly uiStateService = inject(UiStateService);
  private readonly candidateService = inject(CandidateService);

  public openModal(): void {
    this.uiStateService.setModalConfig({
      icon: 'white/sucess',
      title: 'Confirme',
      message: `Deseja deletar o candidato ${this.candidate.name}?`,
      onClose: () => {
        this.uiStateService.setModalConfig(null);
        this.delete();
      },
      onDeny: () => this.uiStateService.setModalConfig(null),
    });
  }

  public closeModal(): void {
    this.uiStateService.setModalConfig(null);
  }

  public delete(): void {
    this.changeLoading.emit(true);
    this.candidateService.delete(this.candidate._id).subscribe({
      next: ({ message }) => {
        if (this.index != null) this.deleteEvent.emit(this.index);
        this.changeLoading.emit(false);
        this.uiStateService.setModalConfig({
          icon: 'white/sucess',
          title: 'Sucesso',
          message,
          onClose: () => this.uiStateService.setModalConfig(null),
        });
      },
      error: ({ error }) => {
        this.changeLoading.emit(false);
        this.uiStateService.setModalConfig({
          icon: 'white/error',
          title: 'Ops! Algo está errado',
          message: error.message,
          onClose: () => this.uiStateService.setModalConfig(null),
        });
      },
    });
  }
}
