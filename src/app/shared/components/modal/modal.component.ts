import { Component, Input } from '@angular/core';
import { ModalConfig } from '../../interfaces/config/ui/modal';
import { CustomButtonComponent } from '../custom/custom-button/custom-button.component';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CustomButtonComponent],
})
export class ModalComponent {
  @Input({ required: true }) public modalConfig!: ModalConfig;

  public close(): void {
    if (this.modalConfig.onDeny) return this.modalConfig.onDeny();
    if (this.modalConfig.onClose) return this.modalConfig.onClose();
    return;
  }
}
