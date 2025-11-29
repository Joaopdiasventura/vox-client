import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Election } from '../../../../core/models/election';
import { CustomLinkComponent } from '../../custom/custom-link/custom-link.component';
import { CustomButtonComponent } from '../../custom/custom-button/custom-button.component';
import { ElectionService } from '../../../../core/services/election/election.service';
import { UiStateService } from '../../../services/ui-state/ui-state.service';

@Component({
  selector: 'election-card',
  templateUrl: './election-card.component.html',
  styleUrls: ['./election-card.component.scss'],
  imports: [CustomLinkComponent, CustomButtonComponent],
})
export class ElectionCardComponent {
  @Input({ required: true }) public election!: Election;
  @Input({ required: false }) public index: number | null = null;
  @Input({ required: false }) public expand!: boolean;

  @Output() public changeLoading = new EventEmitter<boolean>();
  @Output() public deleteEvent = new EventEmitter<number>();

  private readonly electionService = inject(ElectionService);
  private readonly uiStateService = inject(UiStateService);

  public openModal(): void {
    this.uiStateService.setModalConfig({
      icon: 'white/sucess',
      title: 'Confirme',
      message: `Deseja deletar a eleição ${this.election.name}?`,
      onClose: () => {
        this.uiStateService.setModalConfig(null);
        this.delete();
      },
      onDeny: () => this.uiStateService.setModalConfig(null),
    });
  }

  public delete(): void {
    this.changeLoading.emit(true);
    this.electionService.delete(this.election._id).subscribe({
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
