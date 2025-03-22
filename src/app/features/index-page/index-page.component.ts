import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../core/models/user';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Group } from '../../core/models/group';
import { ListComponent } from '../../shared/components/list/list.component';
import { forkJoin, Observable } from 'rxjs';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/services/user/auth/auth.service';
import { GroupService } from '../../core/services/group/group.service';

@Component({
  selector: 'app-index-page',
  imports: [LoadingComponent, HeaderComponent, ListComponent],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.scss',
})
export class IndexPageComponent implements OnInit {
  public currentUser: User | null = null;

  public allGroups: Group[][] = [];

  public isLoading: boolean = false;
  public isMenuOpen: boolean = false;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((result) => this.handleUserConnection(result));
  }

  public findNextGroups(page: number): Observable<Group[]> {
    return this.groupService.findManyByUser(this.currentUser?._id || '', page);
  }

  public deleteGroup(id: string) {
    this.groupService.delete(id).subscribe();
  }

  public navigate(path: string) {
    this.router.navigate([path]);
  }

  public viewGroupDetails(id: string) {
    this.router.navigate(['group', id]);
  }

  public logOut() {
    this.authService.disconnectUser();
    this.router.navigate(['access']);
  }

  private handleUserConnection(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.findFirstsGroups(user._id);
  }

  private findFirstsGroups(user: string) {
    this.isLoading = true;
    forkJoin([
      this.groupService.findManyByUser(user, 0),
      this.groupService.findManyByUser(user, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allGroups[0] = firstPage;
        this.allGroups[1] = secondPage;
        this.isLoading = false;
      },
    });
  }
}
