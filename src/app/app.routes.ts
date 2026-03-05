import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login';
import { RegisterComponent } from './core/auth/register/register';
import { NotFound } from './features/not-found/not-found';
import { roleGuard } from './core/guards/auth-guards-guard';
import { PswHome } from './features/psw/components/psw-home/psw-home';
export const routes: Routes = [
  { path: '', redirectTo: '/care-home', pathMatch: 'full' },
  
  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Care Home Module
  {
    path: 'care-home',
    // canActivate: [roleGuard],
    // data: { role: 'carehome' },
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/careHome/components/care-home-home/care-home-home').then(m => m.CareHomeHome) 
      },
    
      { 
        path: 'history', 
        loadComponent: () => import('./features/careHome/components/history/history').then(m => m.History)},
      { 
        path: 'notifications', 
        loadComponent: () => import('./features/careHome/components/notifications/notifications').then(m => m.Notifications) 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./features/careHome/components/care-home-profile/care-home-profile').then(m => m.CareHomeProfile) 
      },

    ]
  },

  // PSW Module
  {
    path: 'psw',
    // canActivate: [roleGuard],
    // data: { role: 'psw' },
    children: [
  
      {
        path: '',
        loadComponent: () => import('./features/psw/components/psw-home/psw-home').then(m => m.PswHome)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/psw/components/psw-notifications/psw-notifications').then(m => m.PswNotifications)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/psw/components/psw-profile/psw-profile').then(m => m.PswProfile)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/psw/components/history/history').then(m => m.History)
      },
     
    ]
  },
  
  { path: '**', component: NotFound }
];