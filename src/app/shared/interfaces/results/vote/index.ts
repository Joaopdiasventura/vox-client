import { Group } from "../../../../core/models/group";
import { ParticipantResult } from "../participant";

export interface VoteResult {
  group: Group;
  participants: ParticipantResult[];
}
