import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Component({
  selector: "access-input",
  imports: [],
  templateUrl: "./access-input.html",
  styleUrl: "./access-input.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccessInput),
      multi: true,
    },
  ],
})
export class AccessInput implements OnInit, ControlValueAccessor {
  @Input({ required: true }) public required = true;
  @Input({ required: true }) public label = "";
  @Input({ required: true }) public type = "text";
  @Input({ required: true }) public name = "";
  @Input({ required: true }) public id = "";
  @Input({ required: true }) public placeholder = "";
  @Input({ required: true }) public icon = "";

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
