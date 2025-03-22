import { AuthService } from './core/services/user/auth/auth.service';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public isLoading: boolean = false;

  private authService = inject(AuthService);

  public ngOnInit(): void {
    this.authService.loading$.subscribe((loading: boolean) =>
      setTimeout(() => (this.isLoading = loading), 0)
    );
  }
}
