import { Injectable } from '@angular/core';
import { ModalConfig } from '../../interfaces/config/ui/modal';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  public readonly modalConfig = new BehaviorSubject<ModalConfig | null>(null);
  public readonly isLoading = new BehaviorSubject<boolean>(false);
  public readonly isNavbarVisible = new BehaviorSubject<boolean>(true);

  public setModalConfig(config: ModalConfig | null): void {
    this.modalConfig.next(config);
  }

  public setLoading(loading: boolean): void {
    this.isLoading.next(loading);
  }

  public setNavbarVisible(visible: boolean): void {
    this.isNavbarVisible.next(visible);
  }
}
