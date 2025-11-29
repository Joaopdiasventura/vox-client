import { Plan } from '../../types/user/plan';

export interface User {
  _id: string;
  email: string;
  taxId?: string;
  name: string;
  cellphone?: string;
  password?: string;
  plan: Plan;
  votes: number;
  isValid: boolean;
}
