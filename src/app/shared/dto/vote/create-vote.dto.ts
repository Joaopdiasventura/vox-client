export interface CreateVoteDto {
  election: string;
  session: string;
  candidate?: string | null;
}
