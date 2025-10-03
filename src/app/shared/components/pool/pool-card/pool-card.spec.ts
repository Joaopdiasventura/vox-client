import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolCard } from './pool-card';

describe('PoolCard', () => {
  let component: PoolCard;
  let fixture: ComponentFixture<PoolCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoolCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoolCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
