import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="layout-container">
      <header class="app-header">
        <div class="logo">
          <span class="highlight">Zone</span>One
        </div>
        <nav class="nav-links">
          <a href="#" class="active">Categories</a>
          <a href="#">Sessions</a>
          <a href="#">Bookings</a>
        </nav>
        <div class="user-profile">
          <div class="avatar">A</div>
        </div>
      </header>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: var(--bg-dark);
      border-bottom: 1px solid var(--bg-card-hover);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: 1px;
      
      .highlight {
        color: var(--primary);
      }
    }

    .nav-links {
      display: flex;
      gap: 2rem;

      a {
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 1rem;
        position: relative;
        padding-bottom: 0.25rem;

        &:hover, &.active {
          color: var(--text-primary);
        }

        &.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--primary);
          border-radius: 2px;
          box-shadow: 0 0 8px var(--primary-glow);
        }
      }
    }

    .user-profile {
      .avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        cursor: pointer;
        transition: transform var(--transition-fast);

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 0 12px var(--secondary-glow);
        }
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }
  `]
})
export class AppLayoutComponent { }
