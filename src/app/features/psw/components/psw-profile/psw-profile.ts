import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PswNav } from "../../../../shared/components/psw-nav/psw-nav";
import { Footer } from "../../../../shared/components/footer/footer";
import { ProfileService } from '../../../../core/services/profile.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface ProfileInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  profileImage: string | null;
}

@Component({
  selector: 'app-psw-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PswNav, 
    Footer
  ],
  templateUrl: './psw-profile.html',
  styleUrls: ['./psw-profile.scss']
})
export class PswProfile implements OnInit {
  private profileService = inject(ProfileService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  profile: ProfileInfo = {
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    profileImage: null
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
          name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Profile',
          email: p.email ?? '',
          phone: p.phoneNumber ?? '',
          location: address,
          joinDate: '',
          profileImage: null
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

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.profileService.uploadPhoto(file).subscribe({
      next: () => {
        this.notifications.show('Profile photo updated.', 'success');
        this.loadProfile();
      },
      error: (err) => {
        console.error('Photo upload failed', err);
        this.notifications.show('Failed to upload photo.', 'error');
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
