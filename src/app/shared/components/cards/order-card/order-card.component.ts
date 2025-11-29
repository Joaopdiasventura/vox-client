import { Component, Input } from '@angular/core';
import { Order } from '../../../../core/models/order';
import { DatePipe } from '@angular/common';
import { CustomLinkComponent } from '../../custom/custom-link/custom-link.component';

@Component({
  selector: 'order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
  imports: [DatePipe, CustomLinkComponent],
})
export class OrderCardComponent {
  @Input({ required: true }) public order!: Order;

  public get name(): string {
    let name = `${this.order.votes} Votos`;
    if (this.order.plan == 'pro') name += ' e Plano Pro';
    return name;
  }
}
