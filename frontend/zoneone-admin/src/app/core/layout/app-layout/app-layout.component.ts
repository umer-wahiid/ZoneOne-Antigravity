import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

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
            <a routerLink="/categories" routerLinkActive="active" [title]="collapsed ? 'Categories' : ''">
              <i class="pi pi-th-large"></i>
              <span class="link-text">Categories</span>
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
          <div class="user-info">
            <div class="avatar">A</div>
            <span class="user-name">Admin</span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
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
      background-color: #1e293b;
      color: #e2e8f0;
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
      .highlight { color: #60a5fa; }
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #94a3b8;
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
        color: #94a3b8;
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
          color: #e2e8f0;
          background-color: rgba(255,255,255,0.05);
        }

        &.active {
          color: #ffffff;
          background-color: rgba(96, 165, 250, 0.12);
          border-left-color: #60a5fa;
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
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .collapsed .sidebar-bottom {
      padding: 1rem 0;
      display: flex;
      justify-content: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;

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

    /* ---- Main content ---- */
    .main-content {
      flex: 1;
      margin-left: 240px;
      width: calc(100% - 240px);
      transition: margin-left 0.25s ease, width 0.25s ease;
    }

    .collapsed .main-content {
      margin-left: 60px;
      width: calc(100% - 60px);
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  collapsed = false;
  private router = inject(Router);

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
  }
}
