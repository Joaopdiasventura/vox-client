import { Component, inject, OnInit, signal } from '@angular/core';
import { Group } from '../../../core/models/group';
import { GroupService } from '../../../core/services/group/group.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/user';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { GroupCard } from '../../../shared/components/group/group-card/group-card';
import { PaginationControl } from '../../../shared/components/pagination-control/pagination-control';

@Component({
  selector: 'app-group-page',
  imports: [Navbar, GroupCard, PaginationControl],
  templateUrl: './group-page.html',
  styleUrl: './group-page.scss',
})
export class GroupPage implements OnInit {
  public allGroups: Group[] = [];
  public currentGroups = signal<Group[]>([]);

  public currentPage = signal(0);
  public readonly limit = 10;

  private currentUser: User | null = null;

  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);

  public ngOnInit(): void {
    this.authService.user$.subscribe((user) => this.onUserLoaded(user));
  }

  public onPageChange(page: number): void {
    console.log(page);

    this.currentPage.set(page);
    this.loadGroup();
  }

  private onUserLoaded(user: User | null): void {
    if (!user) return;
    this.currentUser = user;
    this.loadGroup();
  }

  private loadGroup(): void {
    if (!this.currentUser) return;
    this.groupService
      .findMany(this.currentUser._id, {
        limit: this.limit,
        page: this.currentPage(),
        orderBy: '_id:asc',
      })
      .subscribe((result) => {
        this.allGroups.push(...result);
        const currentGroups = this.allGroups.slice(this.currentPage() * this.limit, this.limit);
        this.currentGroups.set(currentGroups);
      });
  }
}
