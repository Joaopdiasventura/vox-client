import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['../../../styles/custom/actions.component.scss'],
  standalone: true,
})
export class CustomButtonComponent {
  @Input() public disabled = false;
  @Input() public type: 'button' | 'submit' = 'button';

  @Output() public clicked = new EventEmitter<void>();

  public onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit();
  }
}
