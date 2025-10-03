import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/user';
import { Group } from '../../../core/models/group';
import { Pool } from '../../../core/models/pool';
import { GroupService } from '../../../core/services/group/group.service';
import { PoolService } from '../../../core/services/pool/pool.service';
import { GroupCard } from '../../../shared/components/group/group-card/group-card';
import { PoolCard } from '../../../shared/components/pool/pool-card/pool-card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterModule, GroupCard, PoolCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  public user = signal<User | null>(null);
  public groups = signal<Group[]>([]);
  public pools = signal<Pool[]>([]);

  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);
  private readonly poolService = inject(PoolService);

  public ngOnInit(): void {
    this.authService.user$.subscribe((user) => this.onUserLoaded(user));
  }

  private onUserLoaded(user: User | null): void {
    this.user.set(user);
    if (!user) return;
    this.groupService
      .findMany(user._id, { limit: 2, page: 0, orderBy: '_id:asc' })
      .subscribe((result) => this.groups.set(result));
    this.poolService
      .findMany(user._id, { limit: 2, page: 0, orderBy: '_id:asc' })
      .subscribe((result) => this.pools.set(result));
  }
}
