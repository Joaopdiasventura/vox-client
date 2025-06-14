import { Component } from "@angular/core";
import { Loading } from "../loading/loading";

@Component({
  selector: "loading-page",
  imports: [Loading],
  templateUrl: "./loading-page.html",
  styleUrl: "./loading-page.scss",
})
export class LoadingPage {}
