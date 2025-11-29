import { Component, inject, OnInit, signal } from '@angular/core';
import { Order } from '../../../core/models/order';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { OrderService } from '../../../core/services/order/order.service';
import { OrderCardComponent } from '../../../shared/components/cards/order-card/order-card.component';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  imports: [OrderCardComponent, CustomLinkComponent, IonContent],
})
export class OrderPageComponent implements OnInit {
  public readonly orders = signal<Order[]>([]);

  private readonly uiStateService = inject(UiStateService);
  private readonly orderService = inject(OrderService);

  public ngOnInit(): void {
    this.uiStateService.setLoading(true);
    this.orderService.findMany().subscribe({
      next: (r) => this.orders.set(r),
      complete: () => this.uiStateService.setLoading(false),
    });
  }
}
