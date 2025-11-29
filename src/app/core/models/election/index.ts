import { User } from '../user';

export interface Election {
  _id: string;
  name: string;
  user: User;
}
