import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';
import { ProfileService } from '../../../../core/services/profile.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-care-home-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './care-home-profile.html',
  styleUrls: ['./care-home-profile.scss']
})
export class CareHomeProfile implements OnInit {
  private profileService = inject(ProfileService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  profile = {
    name: 'Care Home',
    email: '',
    phone: '',
    joinDate: '',
    address: ''
  };

  isLoading = true;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: (p) => {
        const address = p.address
          ? `${p.address.street}, ${p.address.city}, ${p.address.country}`
          : '';
        this.profile = {
          name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Care Home',
          email: p.email ?? '',
          phone: p.phoneNumber ?? '',
          joinDate: '',
          address
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.notifications.show('Failed to load profile.', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
