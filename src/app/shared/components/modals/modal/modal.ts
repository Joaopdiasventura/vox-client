import { Component, HostListener, Input } from "@angular/core";
import { CustomButton } from "../../buttons/custom-button/custom-button";

@Component({
  selector: "modal",
  imports: [CustomButton],
  templateUrl: "./modal.html",
  styleUrl: "./modal.scss",
})
export class Modal {
  @Input() public isVisible!: boolean;
  @Input() public showButton = true;
  @Input() public icon!: string | null;
  @Input() public title!: string | null;

  @Input() public onClose: () => void = () => {
    return;
  };

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key == "Enter") this.onClose();
  }
}
