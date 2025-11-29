import { Candidate } from '../candidate';

export interface VoteResult {
  election: string;
  quantity: number;
  candidate: Candidate | null;
}
