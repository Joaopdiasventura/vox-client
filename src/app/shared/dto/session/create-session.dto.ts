import { DateString } from '../../types/date-string';

export interface CreateSessionDto {
  elections: string[];
  startedAt: DateString;
  endedAt: DateString;
}
