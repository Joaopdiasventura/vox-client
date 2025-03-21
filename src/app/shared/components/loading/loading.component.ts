import { Component } from '@angular/core';

@Component({
  selector: 'loading',
  template: `
    <div class="spinner-container">
      <span
        class="spinn-root"
        role="progressbar"
        style="transform: none; color: inherit"
      >
        <svg class="spinn-svg" viewBox="0 0 50 50">
          <circle
            class="spinn-circle circleIndeterminate"
            style="stroke-dasharray: 80px, 200px; stroke-dashoffset: 0"
            cx="25"
            cy="25"
            r="21.5"
            fill="none"
            stroke-width="7.5"
            stroke="#da2020"
            stroke-linecap="round"
          ></circle>
        </svg>
      </span>
    </div>
  `,
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {}
