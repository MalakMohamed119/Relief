import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-psw-nav',
  standalone: true, 
  imports: [RouterLink, RouterLinkActive], 
  templateUrl: './psw-nav.html',
  styleUrls: ['./psw-nav.scss'],
})
export class PswNav {
  userRole: string = 'psw';
  private authService = inject(AuthService);
  private router = inject(Router);

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}