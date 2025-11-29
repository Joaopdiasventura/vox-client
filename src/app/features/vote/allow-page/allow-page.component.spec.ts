import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AllowPageComponent } from './allow-page.component';
import { SessionService } from '../../../core/services/session/session.service';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { SocketService } from '../../../core/services/socket/socket.service';

describe('AllowPageComponent', () => {
  let component: AllowPageComponent;
  let fixture: ComponentFixture<AllowPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowPageComponent],
      providers: [
        { provide: SessionService, useValue: { findMany: () => of([]), getElectionNames: () => '' } },
        { provide: UiStateService, useValue: { setLoading: () => {}, setNavbarVisible: () => {}, setModalConfig: () => {} } },
        { provide: SocketService, useValue: { open: () => {}, emit: () => {}, on: () => {}, off: () => {}, close: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllowPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
