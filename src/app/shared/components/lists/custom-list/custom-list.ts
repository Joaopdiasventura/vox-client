import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Group } from "../../../../core/models/group";
import { Participant } from "../../../../core/models/participant";
import { ModalQuestion } from "../../modals/modal-question/modal-question";
import { QuestionModalConfig } from "../../../interfaces/config/modal";

@Component({
  selector: "custom-list",
  imports: [ModalQuestion],
  templateUrl: "./custom-list.html",
  styleUrl: "./custom-list.scss",
})
export class CustomList {
  @Input() public type!: string;

  @Input() public allElements: (Group | Participant)[][] = [];

  @Input() public findNext!: (
    page: number,
  ) => Observable<(Group | Participant)[]>;

  @Input() public navigate!: (path: string) => void;

  @Input() public delete!: (id: string) => void;

  public currentPage = 0;

  public currentElement: Group | Participant | null = null;

  public questionModalConfig!: QuestionModalConfig;

  public slidingDirection: "left" | "right" | "" = "";

  public useNext(): void {
    if (this.allElements[this.currentPage + 1].length == 0) return;
    this.slidingDirection = "left";
    this.currentPage += 1;
    if (
      !this.allElements[this.currentPage + 1] ||
      this.allElements[this.currentPage + 1].length == 0
    )
      return;

    const nextPage = this.currentPage + 1;
    this.findNext(nextPage).subscribe({
      next: (result) => (this.allElements[nextPage] = result),
    });
  }

  public usePrev(): void {
    if (this.currentPage > 0) {
      this.slidingDirection = "right";
      this.currentPage -= 1;
    }
  }

  public navigateToElement(path: string): void {
    this.currentPage = 0;
    this.navigate(path);
  }

  public deleteElement(): void {
    this.allElements[this.currentPage] = this.allElements[
      this.currentPage
    ].filter((e) => e._id != this.currentElement?._id);
    if (
      this.allElements[this.currentPage + 1] &&
      this.allElements[this.currentPage + 1].length > 0
    ) {
      this.allElements[this.currentPage].push(
        this.allElements[this.currentPage + 1][0],
      );
      this.allElements[this.currentPage + 1].shift();
    }
    if (
      this.allElements[this.currentPage].length == 0 &&
      this.currentPage > 0
    ) {
      this.currentPage -= 1;
    }
    this.delete(this.currentElement?._id as string);
    this.currentElement = null;
    this.questionModalConfig.isVisible = false;
  }

  public openModal(element: Group | Participant): void {
    this.currentElement = element;

    this.questionModalConfig = {
      isVisible: true,
      icon: "svg/white/warn-icon.svg",
      title: "AVISO",
      children: `Deseja deletar o ${this.type} de nome '${element.name}'`,
      onConfirm: (): void => {
        this.deleteElement();
      },
      onDeny: (): void => {
        this.questionModalConfig.isVisible = false;
        this.currentElement = null;
      },
    };
  }

  public animationDone(): void {
    this.slidingDirection = "";
  }
}
