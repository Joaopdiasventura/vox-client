import { Component, Input } from '@angular/core';
import { Group } from './../../../../core/models/group/index';

@Component({
  selector: 'group-card',
  imports: [],
  templateUrl: './group-card.html',
  styleUrl: './group-card.scss',
})
export class GroupCard {
  @Input({ required: true }) public group!: Group;
  @Input({ required: true }) public extended!: boolean;
}
