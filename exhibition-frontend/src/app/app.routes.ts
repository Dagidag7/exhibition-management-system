import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  {
    path: 'exhibitor',
    loadChildren: () => import('./pages/exhibitor/exhibitor.module').then(m => m.ExhibitorModule),
    canActivate: [AuthGuard],
    data: { role: 'exhibitor' }
  },
  {
    path: 'attendee',
    loadComponent: () => import('./pages/attendee/attendee.component').then(m => m.AttendeeComponent),
    canActivate: [AuthGuard],
    data: { role: 'attendee' }
  },
  { path: '**', redirectTo: '' }
];