import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Session } from '../../../core/models/session';
import { SessionService } from '../../../core/services/session/session.service';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { BallotBox } from '../../../core/models/ballot-box';
import { SocketService } from '../../../core/services/socket/socket.service';
import { UpdateBallotBoxDto } from '../../../shared/dto/ballot-box/update-ballot-box.dto';
import { CustomButtonComponent } from '../../../shared/components/custom/custom-button/custom-button.component';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-allow-page',
  templateUrl: './allow-page.component.html',
  styleUrls: ['./allow-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    CustomButtonComponent,
    CustomLinkComponent,
  ],
})
export class AllowPageComponent implements OnInit, OnDestroy {
  public readonly sessions = signal<Session[]>([]);
  public readonly sessionControl = new FormControl<Session | null>(null);
  public readonly ballotBoxes = signal<BallotBox[]>([]);

  private readonly sessionService = inject(SessionService);
  private readonly uiStateService = inject(UiStateService);
  private readonly socket = inject(SocketService);
  private readonly destroy$ = new Subject<void>();
  private createdEvent?: string;
  private removedEvent?: string;
  private updatedEvent?: string;
  private createdListener?: (ballot: BallotBox) => void;
  private removedListener?: (ballot: BallotBox) => void;
  private updatedListener?: (ballot: BallotBox) => void;

  public ngOnInit(): void {
    this.uiStateService.setNavbarVisible(true);
    this.uiStateService.setLoading(true);
    this.socket.open();
    this.sessionControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((session) => this.onSessionChange(session));
    this.sessionService.findMany({}).subscribe({
      next: (result) => this.sessions.set(result),
      complete: () => this.uiStateService.setLoading(false),
    });
  }

  public ngOnDestroy(): void {
    this.cleanupListeners();
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.close();
    this.uiStateService.setNavbarVisible(true);
  }

  public electionNames(session: Session): string {
    return this.sessionService.getElectionNames(session.elections);
  }

  public allow(ballot: BallotBox): void {
    const session = this.sessionControl.value;
    if (!session) return;
    const dto: UpdateBallotBoxDto = {
      session: session._id,
      id: ballot.id,
      isBlocked: false,
    };
    this.socket.emit('updateBallotBox', dto);
  }

  private onSessionChange(session: Session | null): void {
    this.cleanupListeners();
    this.ballotBoxes.set([]);
    if (!session) return;
    this.uiStateService.setLoading(true);
    this.socket.emit('findAllBallotBox', session._id, (boxes: BallotBox[]) => {
      this.ballotBoxes.set(boxes);
      this.uiStateService.setLoading(false);
    });
    this.createdEvent = `ballot-box-created-${session._id}`;
    this.removedEvent = `ballot-box-removed-${session._id}`;
    this.createdListener = (ballot): void =>
      this.ballotBoxes.update((prev) => [...prev, ballot]);
    this.removedListener = (ballot): void =>
      this.ballotBoxes.update((prev) => prev.filter((b) => b.id != ballot.id));
    this.socket.on(this.createdEvent, this.createdListener);
    this.socket.on(this.removedEvent, this.removedListener);
  }

  private cleanupListeners(): void {
    if (this.createdEvent && this.createdListener)
      this.socket.off(this.createdEvent, this.createdListener);
    if (this.removedEvent && this.removedListener)
      this.socket.off(this.removedEvent, this.removedListener);
    if (this.updatedEvent && this.updatedListener)
      this.socket.off(this.updatedEvent, this.updatedListener);
    this.createdEvent = undefined;
    this.removedEvent = undefined;
    this.updatedEvent = undefined;
    this.createdListener = undefined;
    this.removedListener = undefined;
    this.updatedListener = undefined;
  }
}
