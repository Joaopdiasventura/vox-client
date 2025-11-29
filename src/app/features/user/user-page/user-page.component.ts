import { Component, inject, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { User } from '../../../core/models/user';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { CustomButtonComponent } from '../../../shared/components/custom/custom-button/custom-button.component';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/user/user.service';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { UpdateUserDto } from '../../../shared/dto/user/update-user.dto';

type EditableUserField = 'taxId' | 'name' | 'cellphone' | 'password';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss'],
  imports: [
    CustomLinkComponent,
    CustomButtonComponent,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    ReactiveFormsModule,
  ],
})
export class UserPageComponent implements OnInit {
  public readonly user = signal<User | null>(null);

  private readonly uiStateService = inject(UiStateService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  private readonly taxIdValidator = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = control.value as string | null | undefined;
    const digits = this.extractDigits(value);
    if (!digits.length) return value ? { taxId: true } : null;
    return digits.length == 11 || digits.length == 14 ? null : { taxId: true };
  };

  private readonly cellphoneValidator = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = control.value as string | null | undefined;
    const digits = this.extractDigits(value);
    if (!digits.length) return value ? { cellphone: true } : null;
    return digits.length == 11 ? null : { cellphone: true };
  };

  private readonly passwordValidator = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = (control.value as string | null | undefined) ?? '';
    if (!value.trim()) return null;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d@$!%*?&_#]{8,}$/.test(
      value,
    )
      ? null
      : { password: true };
  };

  public form = this.fb.group({
    taxId: ['', [Validators.required, this.taxIdValidator]],
    name: ['', Validators.required],
    cellphone: ['', [Validators.required, this.cellphoneValidator]],
    password: ['', [this.passwordValidator]],
  });

  public ngOnInit(): void {
    this.authService.user$.subscribe((u) => this.handleUserLoad(u));
  }

  public cannotUpdate(field: EditableUserField): boolean {
    if (!this.user()) return false;
    const control = this.form.get(field);
    if (!control) return false;
    if (field == 'taxId' || field == 'cellphone')
      return (
        control.invalid ||
        this.extractDigits(control.value) ==
          this.extractDigits(this.user()![field])
      );

    if (field == 'password') return !control.value || control.invalid;
    return control.invalid || control.value == this.user()![field];
  }

  public update(): void {
    this.uiStateService.setLoading(true);
    const dto = this.buildUpdateDto();
    if (!dto) return this.uiStateService.setLoading(false);
    this.userService.update(dto).subscribe({
      next: ({ message }) => {
        this.uiStateService.setModalConfig({
          icon: 'white/sucess',
          title: 'Perfeito',
          message,
          onClose: () => {
            delete dto.password;
            this.user.update(
              (prev) => ({ ...prev, ...dto }) as unknown as User,
            );
            this.uiStateService.setModalConfig(null);
          },
        });
        this.uiStateService.setLoading(false);
      },
      error: ({ error }) => {
        this.uiStateService.setModalConfig({
          icon: 'white/error',
          title: 'Ops! Algo está errado',
          message: error.message,
          onClose: () => {
            this.uiStateService.setModalConfig(null);
          },
        });
        this.uiStateService.setLoading(false);
      },
    });
  }

  private buildUpdateDto(): UpdateUserDto | null {
    const dto: UpdateUserDto = {};

    const taxIdControl = this.form.get('taxId');
    if (taxIdControl?.valid) {
      const digits = this.extractDigits(taxIdControl.value);
      if (digits) dto.taxId = digits;
    }

    const nameControl = this.form.get('name');
    if (nameControl?.valid) {
      const value = nameControl.value as string | null | undefined;
      if (value?.trim()) dto.name = value;
    }

    const cellphoneControl = this.form.get('cellphone');
    if (cellphoneControl?.valid) {
      const digits = this.extractDigits(cellphoneControl.value);
      if (digits) dto.cellphone = digits;
    }

    const passwordControl = this.form.get('password');
    if (passwordControl?.valid) {
      const value = (passwordControl.value as string | null | undefined) ?? '';
      if (value.trim()) dto.password = value;
    }

    return Object.keys(dto).length ? dto : null;
  }

  public onTaxIdInput(event: Event): void {
    const value = this.getInputValue(event);
    const formatted = this.formatTaxId(this.extractDigits(value));
    this.form.get('taxId')?.setValue(formatted, { emitEvent: false });
  }

  public onCellphoneInput(event: Event): void {
    const value = this.getInputValue(event);
    const formatted = this.formatCellphone(this.extractDigits(value));
    this.form.get('cellphone')?.setValue(formatted, { emitEvent: false });
  }

  private getInputValue(event: Event): string {
    const customEvent = event as CustomEvent;
    const detailValue = (customEvent.detail as { value?: string })?.value;
    return detailValue ?? '';
  }

  private extractDigits(value: unknown): string {
    return (value as string | null | undefined)?.replace(/\D/g, '') ?? '';
  }

  private formatTaxId(raw: string): string {
    const digits = raw.slice(0, 14);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    if (digits.length <= 11)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
        6,
        9,
      )}-${digits.slice(9)}`;

    if (digits.length <= 12)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
        5,
        8,
      )}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8,
    )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  private formatCellphone(raw: string): string {
    const digits = raw.slice(0, 11);
    if (!digits.length) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  private handleUserLoad(user: User | null): void {
    if (!user) return;
    this.user.set(user);
    this.form.patchValue({
      taxId: this.formatTaxId(this.extractDigits(user.taxId)),
      name: user.name,
      cellphone: this.formatCellphone(this.extractDigits(user.cellphone)),
    });
  }
}
