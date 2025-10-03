import { Component, Input } from '@angular/core';
import { Pool } from '../../../../core/models/pool';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'pool-card',
  imports: [DatePipe],
  templateUrl: './pool-card.html',
  styleUrl: './pool-card.scss',
})
export class PoolCard {
  @Input({ required: true }) public pool!: Pool;
  @Input({ required: true }) public extended!: boolean;

  
}
