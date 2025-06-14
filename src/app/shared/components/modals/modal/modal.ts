import { Component, HostListener, Input } from "@angular/core";
import { CustomButton } from "../../custom-button/custom-button";

@Component({
  selector: "modal",
  imports: [CustomButton],
  templateUrl: "./modal.html",
  styleUrl: "./modal.scss",
})
export class Modal {
  @Input() public isVisible = false;
  @Input() public title: string | null = null;
  @Input() public children: string | null = null;

  @Input() public onClose: () => void = () => {
    return;
  };

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key == "Enter") this.onClose();
  }
}
