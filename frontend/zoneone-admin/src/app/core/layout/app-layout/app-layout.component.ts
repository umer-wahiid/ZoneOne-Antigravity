import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-container" [class.collapsed]="collapsed">
      <aside class="sidebar">
        <div class="sidebar-top">
          <div class="logo-row">
            <div class="logo" *ngIf="!collapsed">
              <span class="highlight">Zone</span>One
            </div>
            <button class="toggle-btn" (click)="collapsed = !collapsed">
              <i class="pi" [class.pi-angle-left]="!collapsed" [class.pi-angle-right]="collapsed"></i>
            </button>
          </div>
          <nav class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active" [title]="collapsed ? 'Dashboard' : ''">
              <i class="pi pi-desktop"></i>
              <span class="link-text">Dashboard</span>
            </a>
            <a routerLink="/users" routerLinkActive="active" [title]="collapsed ? 'User Management' : ''">
              <i class="pi pi-users"></i>
              <span class="link-text">User Management</span>
            </a>
            <a routerLink="/categories" routerLinkActive="active" [title]="collapsed ? 'Games' : ''">
              <i class="pi pi-th-large"></i>
              <span class="link-text">Games</span>
            </a>
            <a routerLink="/rooms" routerLinkActive="active" [title]="collapsed ? 'Rooms / Tables' : ''">
              <i class="pi pi-building"></i>
              <span class="link-text">Rooms / Tables</span>
            </a>
            <a routerLink="/extras" routerLinkActive="active" [title]="collapsed ? 'Extras / Beverages' : ''">
              <i class="pi pi-box"></i>
              <span class="link-text">Extras / Beverages</span>
            </a>
          </nav>
        </div>
        <div class="sidebar-bottom">
          <div class="user-info mb-3">
            <div class="avatar">{{ user()?.fullName?.substring(0, 1) || 'U' }}</div>
            <span class="user-name">{{ user()?.fullName || 'User' }}</span>
          </div>
          <a class="nav-link logout-btn" (click)="onLogout()" [title]="collapsed ? 'Logout' : ''">
             <i class="pi pi-power-off"></i>
             <span class="link-text">Logout</span>
          </a>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
        <footer class="footer">
          <div class="footer-content">
            <span class="copyright">&copy; {{ currentYear }} <span class="brand">ZoneOne</span>. All rights reserved.</span>
            <div class="footer-meta">
              <span>Managed by <span class="brand">Youros Technologies</span> v{{ version }}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
    }

    /* ---- Sidebar ---- */
    .sidebar {
      width: 240px;
      min-height: 100vh;
      background-color: #055a87;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      box-shadow: 2px 0 8px rgba(0,0,0,0.1);
      transition: width 0.25s ease;
      overflow: hidden;
    }

    .collapsed .sidebar { width: 60px; }

    .sidebar-top { padding: 1rem 0; }

    /* Logo row */
    .logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.25rem 0.75rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .logo {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: 1px;
      white-space: nowrap;
      color: #ffffff;
      .highlight { color: #8ecae6; }
    }

    .toggle-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      width: 30px; height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.15s ease;
      font-size: 1.1rem;

      &:hover {
        background-color: rgba(255,255,255,0.1);
        color: #e2e8f0;
      }
    }

    .collapsed .logo-row {
      justify-content: center;
      padding: 0.25rem 0 1rem;
    }

    /* Nav links */
    .nav-links {
      display: flex;
      flex-direction: column;
      padding: 0.75rem 0;

      a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 1.25rem;
        color: rgba(255, 255, 255, 0.75);
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.15s ease;
        border-left: 3px solid transparent;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;

        i {
          font-size: 1rem;
          min-width: 20px;
          text-align: center;
        }

        &:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.1);
        }

        &.active {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.2);
          border-left-color: #ffffff;
          font-weight: 600;
        }
      }
    }

    .collapsed .nav-links a {
      justify-content: center;
      padding: 0.65rem 0;
      border-left: none;
    }

    .collapsed .link-text,
    .collapsed .user-name { display: none; }

    /* Bottom */
    .sidebar-bottom {
      padding: 1rem 0;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .collapsed .sidebar-bottom {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1.25rem;
      margin-bottom: 0.75rem;

      .avatar {
        width: 34px; height: 34px;
        background: linear-gradient(135deg, #3b82f6, #ec4899);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.8rem;
        color: white;
        flex-shrink: 0;
      }

      .user-name {
        font-size: 0.85rem;
        font-weight: 500;
        color: #cbd5e1;
        white-space: nowrap;
      }
    }

    .collapsed .user-info {
        justify-content: center;
        padding: 0;
        margin-bottom: 0 !important;
    }

    .logout-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      color: rgba(255, 255, 255, 0.75);
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.15s ease;
      
      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
      }

      i { 
        font-size: 1rem; 
        min-width: 34px; 
        text-align: center;
      }
    }

    .collapsed .logout-btn {
        justify-content: center;
        padding: 0.65rem 0;
    }

    /* ---- Main content ---- */
    .main-content {
      flex: 1;
      margin-left: 240px;
      width: calc(100% - 240px);
      transition: margin-left 0.25s ease, width 0.25s ease;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
    }

    .content-wrapper {
      flex: 1;
      padding-bottom: 2rem;
    }

    .footer {
      background-color: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 1rem 1.5rem;
      margin-top: auto;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #64748b;
      font-size: 0.85rem;
    }

    .brand {
      color: #055a87;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .footer-meta {
      opacity: 0.7;
      font-size: 0.8rem;
    }

    .collapsed .main-content {
      margin-left: 60px;
      width: calc(100% - 60px);
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  collapsed = false;
  currentYear = new Date().getFullYear();
  version = environment.appVersion;
  private router = inject(Router);
  private authService = inject(AuthService);

  user = signal(this.authService.currentUserValue);

  ngOnInit() {
    // Initial check
    this.collapsed = this.router.url.includes('/dashboard');

    // Subscribe to navigation events to auto-collapse on dashboard
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects.includes('/dashboard')) {
        this.collapsed = true;
      }
    });

    // Update user signal when auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
    });
  }

  onLogout() {
    this.authService.logout();
  }
}
