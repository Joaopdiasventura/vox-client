export interface UpdateBallotBoxDto {
  id: string;
  session: string;
  name?: string;
  isBlocked?: boolean;
}
