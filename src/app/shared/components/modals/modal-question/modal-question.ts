import { Component, HostListener, Input } from "@angular/core";

@Component({
  selector: "modal-question",
  imports: [],
  templateUrl: "./modal-question.html",
  styleUrl: "./modal-question.scss",
})
export class ModalQuestion {
  @Input() public isVisible = false;
  @Input() public title: string | null = null;
  @Input() public children: string | null = null;

  @Input() public onConfirm: () => void = () => {
    return;
  };
  @Input() public onDeny: () => void = () => {
    return;
  };

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key == "Enter") this.onConfirm();
  }
}
