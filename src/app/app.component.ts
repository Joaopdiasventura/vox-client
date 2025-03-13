import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public isLoading: boolean = false;

  private authGuard = inject(AuthGuard);

  public ngOnInit(): void {
    this.authGuard.loading$.subscribe({
      next: (loading: boolean) => (this.isLoading = loading),
    });
  }
}
