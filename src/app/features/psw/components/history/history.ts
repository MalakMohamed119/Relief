import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PswNav } from "../../../../shared/components/psw-nav/psw-nav";
import { Footer } from "../../../../shared/components/footer/footer";
import { PswApplicationsService } from '../../../../core/services/psw-applications.service';

interface PswApplication {
  jobRequestItemId: string;
  offerId: string;
  offerTitle: string;
  careHomeName: string;
  address: string;
  hourlyRate: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  statusCode: number;
}

class PswApplicationPresenter {
  constructor(public app: PswApplication) {}

  get statusLabel(): string {
    switch (this.app.statusCode) {
      case 2: return 'rejected';
      case 3: return 'accepted';
      case 5: return 'cancelled';
      default: return 'pending';
    }
  }

  get statusDisplay(): string {
    switch (this.app.statusCode) {
      case 2: return 'Rejected';
      case 3: return 'Accepted';
      case 5: return 'Cancelled';
      default: return 'Pending';
    }
  }
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, PswNav, Footer, DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  applications: PswApplicationPresenter[] = [];
  isLoading = true;
  selectedApp: PswApplicationPresenter | null = null;

  constructor(
    private pswApplicationsService: PswApplicationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.pswApplicationsService.getPswApplications().subscribe({
      next: (apps: any[]) => {
        const decided = (apps ?? []).filter((a: any) => {
          const code = Number(a.statusCode ?? a.status ?? 1);
          return code === 2 || code === 3 || code === 5;
        });
        this.applications = decided.map(app => new PswApplicationPresenter(app));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewRequest(app: PswApplicationPresenter): void {
    this.selectedApp = app;
  }

  closeDetails(): void {
    this.selectedApp = null;
  }
}
