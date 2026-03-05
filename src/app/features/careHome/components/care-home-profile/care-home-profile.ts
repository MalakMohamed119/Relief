import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';

@Component({
  selector: 'app-care-home-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './care-home-profile.html',
  styleUrls: ['./care-home-profile.scss']
})
export class CareHomeProfile {
  // Placeholder – يمكنك ربطه لاحقاً بالبيانات الحقيقية
  profile = {
    name: 'Care Home',
    email: '',
    phone: '',
    joinDate: ''
  };
}
