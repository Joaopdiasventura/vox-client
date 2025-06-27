import { Component, Input } from "@angular/core";

@Component({
  selector: "modal-question",
  imports: [],
  templateUrl: "./modal-question.html",
  styleUrl: "./modal-question.scss",
})
export class ModalQuestion {
  @Input() public isVisible!: boolean;
  @Input() public showButton = true;
  @Input() public icon!: string | null;
  @Input() public title!: string | null;

  @Input() public confirm!: () => void;
  @Input() public deny!: () => void;
}
