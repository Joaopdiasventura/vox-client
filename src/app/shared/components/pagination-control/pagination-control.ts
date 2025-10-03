import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pagination-control',
  imports: [],
  templateUrl: './pagination-control.html',
  styleUrl: './pagination-control.scss',
})
export class PaginationControl {
  @Input({ required: true }) public currentPage!: number;
  @Input({ required: true }) public showNextPage!: boolean;

  @Output() public pageChange = new EventEmitter<number>();

  public prevPage(): void {
    this.pageChange.emit(this.currentPage - 1);
  }

  public nextPage(): void {
    console.log('opa');

    this.pageChange.emit(this.currentPage + 1);
  }
}
