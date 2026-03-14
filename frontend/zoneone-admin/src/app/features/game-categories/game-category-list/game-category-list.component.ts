import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { GameCategory } from '../../../core/models/game-category.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-category-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="list-container">
      <div class="list-header">
        <div>
          <h1 class="page-title">Game Categories</h1>
          <p class="page-subtitle">Manage gaming zones and their settings</p>
        </div>
        <button class="btn-primary" (click)="navigateToAdd()">
          + Add New Category
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Description</th>
              <th>Theme Color</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories$ | async">
              <td>
                <div class="icon-preview" [style.background-color]="category.themeColor + '33'">
                  <img [src]="category.iconUrl || '/assets/icons/default.svg'" alt="icon" onerror="this.src='/assets/icons/table-tennis.svg'">
                </div>
              </td>
              <td class="fw-bold">{{ category.name }}</td>
              <td class="text-muted">{{ category.description }}</td>
              <td>
                <div class="color-indicator">
                  <span class="color-dot" [style.background-color]="category.themeColor"></span>
                  {{ category.themeColor }}
                </div>
              </td>
              <td class="actions-col">
                <button class="action-btn edit" (click)="navigateToEdit(category.id)">Edit</button>
                <button class="action-btn delete" (click)="deleteCategory(category.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="(categories$ | async)?.length === 0">
               <td colspan="5" class="empty-state">No Game Categories found. Try adding one!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .list-container {
      animation: fadeIn var(--transition-normal);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;

      .page-title {
        font-size: 2.5rem;
        margin-bottom: 0.25rem;
      }

      .page-subtitle {
        color: var(--text-muted);
      }
    }

    .btn-primary {
      background-color: var(--primary);
      color: var(--bg-darker);
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);
      box-shadow: 0 0 15px var(--primary-glow);

      &:hover {
        background-color: #00cce6;     
        transform: translateY(-2px);
      }
    }

    .table-container {
      background-color: var(--bg-card);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th, td {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }

      th {
        color: var(--text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
        background-color: rgba(0,0,0,0.1);
      }

      tbody tr {
        transition: background-color var(--transition-fast);
        &:hover {
          background-color: var(--bg-card-hover);
        }
      }
    }

    .icon-preview {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 24px;
        height: 24px;
        filter: invert(1);
      }
    }

    .fw-bold { font-weight: 600; color: var(--text-primary); }
    .text-muted { color: var(--text-muted); font-size: 0.95rem; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

    .color-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: monospace;
      
      .color-dot {
        width: 16px;
        height: 16px;
        border-radius: 4px;
      }
    }

    .actions-col {
      text-align: right;
    }

    .action-btn {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-left: 0.5rem;
      background: transparent;
      
      &.edit {
        color: var(--primary);
        border: 1px solid var(--primary);
        &:hover { background: var(--primary-glow); }
      }
      
      &.delete {
        color: #ff3333;
        border: 1px solid #ff3333;
        &:hover { background: rgba(255, 51, 51, 0.15); }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: var(--text-muted);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GameCategoryListComponent implements OnInit {
    private categorySvc = inject(GameCategoryService);
    private router = inject(Router);

    categories$: Observable<GameCategory[]> = this.categorySvc.categories$;

    ngOnInit(): void { }

    navigateToAdd(): void {
        this.router.navigate(['/categories/new']);
    }

    navigateToEdit(id: string): void {
        this.router.navigate(['/categories/edit', id]);
    }

    deleteCategory(id: string): void {
        if (confirm('Are you sure you want to delete this category?')) {
            this.categorySvc.deleteCategory(id).subscribe();
        }
    }
}
