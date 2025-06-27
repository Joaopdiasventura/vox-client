/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, forwardRef, Input, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { SelectOption } from "../../../interfaces/config/select";

@Component({
  selector: "custom-select",
  templateUrl: "./custom-select.html",
  styleUrls: ["./custom-select.scss"],
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelect),
      multi: true,
    },
  ],
})
export class CustomSelect implements OnInit, ControlValueAccessor {
  @Input() public options: SelectOption[] = [];
  @Input() public id!: string;
  @Input() public label!: string;
  @Input() public default!: string;

  public value: any = null;
  public disabled = false;

  public ngOnInit(): void {
    this.id += "-select";
  }

  public onTouched: () => void = () => {
    return;
  };

  private onChange: (_: any) => void = () => {
    return;
  };

  public writeValue(obj: any): void {
    this.value = obj;
  }

  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = select.value;
    this.value = val;
    this.onChange(val);
    this.onTouched();
  }
}
