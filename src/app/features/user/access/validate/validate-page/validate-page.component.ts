import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../core/services/user/user.service';
import { AuthService } from '../../../../../core/services/user/auth/auth.service';
import { UiStateService } from '../../../../../shared/services/ui-state/ui-state.service';

@Component({
  selector: 'app-validate-page',
  templateUrl: './validate-page.component.html',
  styleUrls: ['./validate-page.component.scss'],
  imports: [],
})
export class ValidatePageComponent implements OnInit {
  private readonly uiStateService = inject(UiStateService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public ngOnInit(): void {
    this.uiStateService.setLoading(true);
    this.route.paramMap.subscribe({
      next: (params) => {
        const token = params.get('token');
        if (!token) return;
        this.userService.validateAccount(token).subscribe({
          next: (user) => {
            localStorage.setItem('token', token);
            this.authService.updateUserData(user);
            this.router.navigate(['/']);
            this.uiStateService.setLoading(false);
          },
          error: () => {
            this.router.navigate(['/user', 'access']);
            this.uiStateService.setLoading(false);
          },
        });
      },
    });
  }
}
