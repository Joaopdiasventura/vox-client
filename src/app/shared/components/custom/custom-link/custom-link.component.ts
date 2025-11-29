import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-custom-link',
  templateUrl: './custom-link.component.html',
  styleUrls: ['../../../styles/custom/actions.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class CustomLinkComponent {
  @Input() public path: string[] | null = null;
  @Input() public queryParams: object | null = null;
  @Input() public href: string | null = null;
  @Input() public target: string = '_blank';

  public get isExternal(): boolean {
    return !!this.href;
  }
}
