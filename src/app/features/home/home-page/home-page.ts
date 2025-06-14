import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { AuthService } from "../../../core/services/auth/auth.service";
import { User } from "../../../core/models/user";
import { CustomHeader } from "../../../shared/components/custom-header/custom-header";
import { Loading } from "../../../shared/components/loadings/loading/loading";
import { Group } from "../../../core/models/group";
import { GroupService } from "../../../core/services/group/group.service";
import { CustomList } from "../../../shared/components/custom-list/custom-list";

@Component({
  selector: "app-home-page",
  imports: [CustomHeader, Loading, CustomList],
  templateUrl: "./home-page.html",
  styleUrl: "./home-page.scss",
})
export class HomePage implements OnInit {
  public isLoading = false;

  public allGroups: Group[][] = [];

  private _currentUser: User | null = null;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  public ngOnInit(): void {
    const init$ = this.authService.currentUserData
      ? of(this.authService.currentUserData)
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public get currentUser(): User | null {
    return this._currentUser;
  }

  public findNextGroups(page: number): Observable<Group[]> {
    return this.groupService.findManyByUser(this.currentUser?._id || "", page);
  }

  public deleteGroup(id: string): void {
    this.groupService.delete(id).subscribe();
  }

  public navigate(path: string): void {
    this.router.navigate([path]);
  }

  public viewGroupDetails(id: string): void {
    this.router.navigate(["group", id]);
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    this.loadData();
  }

  private loadData(): void {
    if (!this._currentUser) return;
    this.isLoading = true;
    forkJoin([
      this.groupService.findManyByUser(this._currentUser._id, 0),
      this.groupService.findManyByUser(this._currentUser._id, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allGroups[0] = firstPage;
        this.allGroups[1] = secondPage;
        this.isLoading = false;
      },
    });
  }
}
