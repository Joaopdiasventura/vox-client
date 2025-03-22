import { Routes } from '@angular/router';
import { IndexPageComponent } from './features/index-page/index-page.component';
import { AccessPageComponent } from './features/user/access-page/access-page.component';
import { AddGroupPageComponent } from './features/group/add-group-page/add-group-page.component';
import { FindGroupPageComponent } from './features/group/find-group-page/find-group-page.component';
import { AddParticipantPageComponent } from './features/participant/add-participant-page/add-participant-page.component';
import { StartVotePageComponent } from './features/vote/start-vote-page/start-vote-page.component';
import { FollowVotePageComponent } from './features/vote/follow-vote-page/follow-vote-page.component';

export const routes: Routes = [
  { path: '', component: IndexPageComponent },
  { path: 'access', component: AccessPageComponent },
  {
    path: 'group/add',
    component: AddGroupPageComponent,
  },
  {
    path: 'group/:id',
    component: FindGroupPageComponent,
  },
  {
    path: 'participant/add',
    component: AddParticipantPageComponent,
  },
  {
    path: 'votes/start',
    component: StartVotePageComponent,
  },
  {
    path: 'votes/follow',
    component: FollowVotePageComponent,
  },
];
