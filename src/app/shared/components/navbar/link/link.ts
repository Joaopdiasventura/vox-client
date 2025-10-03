import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'navbar-link',
  imports: [RouterModule, NgStyle],
  templateUrl: './link.html',
  styleUrl: './link.scss',
})
export class Link {
  @Input({ required: true }) public image!: string;
  @Input({ required: true }) public text!: string;
  @Input({ required: true }) public path!: string[];
}
