import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomButtonComponent } from '../../../../shared/components/custom/custom-button/custom-button.component';
import { CustomLinkComponent } from '../../../../shared/components/custom/custom-link/custom-link.component';
import {
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { OrderService } from '../../../../core/services/order/order.service';
import { PlanValues } from '../../../../core/enums/user/plan-values';
import { UiStateService } from '../../../../shared/services/ui-state/ui-state.service';
import { CreateOrderDto } from '../../../../shared/dto/order/create-order.dto';
import { Plan } from '../../../../core/types/user/plan';
import { AuthService } from '../../../../core/services/user/auth/auth.service';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-create-order-page',
  templateUrl: './create-order-page.component.html',
  styleUrls: ['./create-order-page.component.scss'],
  imports: [
    CustomLinkComponent,
    CustomButtonComponent,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
  ],
})
export class CreateOrderPageComponent implements OnInit {
  public readonly user = signal<User | null>(null);

  private readonly uiStateService = inject(UiStateService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  public ngOnInit(): void {
    this.authService.user$.subscribe((u) => this.user.set(u));
  }

  public form = this.fb.group({
    votes: ['', [Validators.required, Validators.min(100)]],
    plan: ['basic', Validators.required],
  });

  public planValue(plan: Plan): string {
    return (PlanValues[plan] / 100).toFixed(2).replace('.', ',');
  }

  public submit(): void {
    this.uiStateService.setLoading(true);
    this.orderService
      .create(this.form.value as unknown as CreateOrderDto)
      .subscribe({
        next: (result) => {
          this.uiStateService.setLoading(false);
          this.uiStateService.setModalConfig({
            icon: 'white/sucess',
            title: 'Perfeito',
            message: 'Você irá para a página de pagamento do pedido',
            onClose: () => this.uiStateService.setModalConfig(null),
          });
          window.location.href = result.paymentUrl;
        },
        error: ({ error }) => {
          this.uiStateService.setModalConfig({
            icon: 'white/error',
            title: 'Ops! Algo está errado',
            message: error.message,
            onClose: () => {
              this.uiStateService.setModalConfig(null);
            },
          });
          this.uiStateService.setLoading(false);
        },
      });
  }
}
