import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PswNav } from "../../../../shared/components/psw-nav/psw-nav";
import { Footer } from "../../../../shared/components/footer/footer";

interface ProfileInfo {
  name: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  profileImage: string;
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
export class PswProfile {
  profile: ProfileInfo = {
    name: 'John Doe',
    position: 'Nursing Assistant',
    email: 'john.doe@example.com',
    phone: '+201234567890',
    location: 'New York, USA',
    joinDate: 'January 2023',
    profileImage: '/assets/person.png'
  };

  // For demonstration - in a real app, this would come from a service
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
