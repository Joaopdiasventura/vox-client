import { User } from "../user";

export interface Group {
  _id: string;
  name: string;
  user: User;
  group?: Group;
}
