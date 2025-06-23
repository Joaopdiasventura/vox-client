import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "custom-input",
  templateUrl: "./custom-input.html",
  styleUrls: ["./custom-input.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInput),
      multi: true,
    },
  ],
})
export class CustomInput implements OnInit, ControlValueAccessor {
  @Input() public required = true;
  @Input() public label = "";
  @Input() public type = "text";
  @Input() public name = "";
  @Input() public id = "";
  public value = "";
  public disabled = false;

  public onChange!: (value: string) => void;
  public onTouched!: () => void;

  public ngOnInit(): void {
    this.id += "-input";
  }

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public handleInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
  }

  public handleBlur(): void {
    this.onTouched();
  }
}
