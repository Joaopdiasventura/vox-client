import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, forkJoin } from "rxjs";
import { Group } from "../../../../core/models/group";
import { Participant } from "../../../../core/models/participant";
import { User } from "../../../../core/models/user";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { GroupService } from "../../../../core/services/group/group.service";
import { ParticipantService } from "../../../../core/services/participant/participant.service";
import { CustomHeader } from "../../../../shared/components/headers/custom-header/custom-header";
import { Loading } from "../../../../shared/components/loadings/loading/loading";
import { CustomList } from "../../../../shared/components/lists/custom-list/custom-list";
import { CustomButton } from "../../../../shared/components/buttons/custom-button/custom-button";

@Component({
  selector: "app-find-group-page",
  imports: [CustomHeader, CustomList, Loading, CustomButton],
  templateUrl: "./find-group-page.html",
  styleUrl: "./find-group-page.scss",
})
export class FindGroupPage implements OnInit {
  public id = "";
  public type = "";

  public _currentUser: User | null = null;
  public currentGroup: Group | null = null;

  public allElements: (Group | Participant)[][] = [];

  public delete: (id: string) => void = this.deleteSubGroup;
  public findNext: (page: number) => Observable<(Group | Participant)[]> =
    this.findNextSubGroups;
  public navigate: (path: string) => void = () => {
    return;
  };

  public isLoading = false;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public ngOnInit(): void {
    const init$ = this.authService.currentUserData
      ? this.authService.currentUserData$
      : this.authService.connectUser();

    init$.subscribe((user) => this.handleUserConnection(user));
  }

  public findNextSubGroups(page: number): Observable<Group[]> {
    return this.groupService.findManyByGroup(this.id, page);
  }

  public navigateToGroup(id: string): void {
    this.router.navigate(["group", id]).then(() => {
      this.id = id;
      this.loadData();
    });
  }

  public goBack(): void {
    this.router.navigate(["group", this.currentGroup?.group]).then(() => {
      this.id = (this.currentGroup?.group as unknown as string) || "";
      this.loadData();
    });
  }

  public deleteSubGroup(id: string): void {
    this.groupService.delete(id).subscribe();
  }

  public findNextParticipants(page: number): Observable<Participant[]> {
    return this.participantService.findManyByGroup(this.id, page);
  }

  public deleteParticipant(id: string): void {
    this.participantService.delete(id).subscribe();
  }

  private handleUserConnection(user: User | null): void {
    if (!user) return;
    this._currentUser = user;
    this.id = this.route.snapshot.paramMap.get("id") as string;
    this.loadData();
  }

  private loadData(): void {
    this.findGroup();
    this.findSubGroups();
  }

  private findGroup(): void {
    this.groupService.findById(this.id).subscribe({
      next: (result) => (this.currentGroup = result),
      complete: () => (this.isLoading = false),
    });
  }

  private findSubGroups(): void {
    this.isLoading = true;
    forkJoin([
      this.groupService.findManyByGroup(this.id, 0),
      this.groupService.findManyByGroup(this.id, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allElements[0] = firstPage;
        this.allElements[1] = secondPage;
        if (firstPage.length == 0 && secondPage.length == 0)
          this.findParticipants();
        else {
          this.type = "grupo";
          this.findNext = this.findNextSubGroups;
          this.navigate = this.navigateToGroup;
          this.isLoading = false;
        }
      },
    });
  }

  private findParticipants(): void {
    forkJoin([
      this.participantService.findManyByGroup(this.id, 0),
      this.participantService.findManyByGroup(this.id, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allElements[0] = firstPage;
        this.allElements[1] = secondPage;
        if (firstPage.length > 0) this.type = "participante";
        this.findNext = this.findNextParticipants;
        this.delete = this.deleteParticipant;
        this.isLoading = false;
      },
    });
  }
}
