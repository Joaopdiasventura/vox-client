import { Component, Input } from "@angular/core";

@Component({
  selector: "custom-button",
  imports: [],
  templateUrl: "./custom-button.html",
  styleUrl: "./custom-button.scss",
})
export class CustomButton {
  @Input() public content = "";
  @Input() public onClick: () => void = () => {
    return;
  };
}
