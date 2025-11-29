import { DateString } from '../../../shared/types/date-string';
import { Plan } from '../../types/user/plan';
import { User } from '../user';

export interface Order {
  plan: Plan;
  user: User;
  value: number;
  votes: number;
  payment: string;
  paymentUrl: string;
  createdAt: DateString;
  updatedAt: DateString;
}
