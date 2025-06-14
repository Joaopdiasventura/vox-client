import { Message } from "./message";
import { User } from "../../../core/models/user";

export interface AuthMessage extends Message {
  token: string;
  user: User;
}
