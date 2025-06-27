import { Routes } from "@angular/router";
import { AccessPage } from "./features/auth/access/access-page/access-page";
import { AddGroupPage } from "./features/group/add-group/add-group-page/add-group-page";
import { FindGroupPage } from "./features/group/find-group/find-group-page/find-group-page";
import { HomePage } from "./features/home/home-page/home-page";
import { AddParticipantPage } from "./features/participant/add-participant/add-participant-page/add-participant-page";
import { VotePage } from "./features/vote/vote-page/vote-page";
import { AllowVotePage } from "./features/vote/allow-vote/allow-vote-page/allow-vote-page";
import { FollowVotePage } from "./features/vote/follow-vote/follow-vote-page/follow-vote-page";
import { VerifyEmailPage } from "./features/auth/verify-email/verify-email-page/verify-email-page";

export const routes: Routes = [
  { path: "", component: HomePage },
  { path: "access", component: AccessPage },
  { path: "verify/email", component: VerifyEmailPage },
  {
    path: "group/add",
    component: AddGroupPage,
  },
  {
    path: "group/:id",
    component: FindGroupPage,
  },
  {
    path: "participant/add",
    component: AddParticipantPage,
  },
  {
    path: "vote",
    component: VotePage,
  },
  {
    path: "votes/follow",
    component: FollowVotePage,
  },
  {
    path: "votes/allow",
    component: AllowVotePage,
  },
];
