import { Group } from '../group';

export interface Pool {
  group: Group;
  votes: number;
  start: Date;
  end: Date;
}
