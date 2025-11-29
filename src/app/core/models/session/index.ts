import { Election } from '../election';
import { DateString } from '../../../shared/types/date-string';

export interface Session {
  _id: string;
  elections: Election[];
  votes: number;
  startedAt: DateString;
  endedAt: DateString;
}
