import { Component, Input, OnInit } from '@angular/core';
import { ModalConfig } from '../../../interfaces/modals/modal-config';

@Component({
  selector: 'modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements OnInit {
  @Input({ required: true }) public modalConfig!: ModalConfig;

  public imgSrc!: string;

  public ngOnInit(): void {
    this.imgSrc =
      !this.modalConfig || this.modalConfig.hasError
        ? 'assets/svg/modal/error.svg'
        : 'assets/svg/modal/sucess.svg';
  }

  public get message(): string {
    return Array.isArray(this.modalConfig.message)
      ? this.modalConfig.message[0]
      : this.modalConfig.message;
  }
}
