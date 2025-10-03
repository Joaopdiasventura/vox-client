export interface FindGroupDto {
  page?: number;
  limit?: number;
  orderBy?: string;
  withSubGroups?: boolean;
  withCandidates?: boolean;
}
