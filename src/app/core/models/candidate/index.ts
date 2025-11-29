import { Election } from '../election';

export interface Candidate {
  _id: string;
  name: string;
  election: Election;
}
