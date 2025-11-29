import { Plan } from '../../../core/types/user/plan';

export interface CreateOrderDto {
  plan: Plan;
  votes: number;
}
