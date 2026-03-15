import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { GameCategory } from '../../../core/models/game-category.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-category-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <div class="list-container">
      <div class="list-header">
        <div>
          <h1 class="page-title">Game Categories</h1>
          <p class="page-subtitle">Manage gaming zones and their settings</p>
        </div>
        <p-button label="Add New Category" icon="pi pi-plus" (onClick)="navigateToAdd()"></p-button>
      </div>

      <p-table #dt [value]="(categories$ | async) || []" [tableStyle]="{ 'min-width': '50rem' }" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="true" [stripedRows]="true"
               [globalFilterFields]="['name', 'description']">
        <ng-template pTemplate="caption">
            <div class="table-caption">
                <p-iconField iconPosition="left">
                    <p-inputIcon styleClass="pi pi-search" />
                    <input pInputText type="text" #filter (input)="dt.filterGlobal(filter.value, 'contains')" placeholder="Search categories..." />
                </p-iconField>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>Icon</th>
            <th pSortableColumn="name">
              <div class="flex-header">
                Name <p-sortIcon field="name"></p-sortIcon>
                <p-columnFilter type="text" field="name" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="description">
              <div class="flex-header">
                Description <p-sortIcon field="description"></p-sortIcon>
                <p-columnFilter type="text" field="description" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>Theme Color</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
          <tr>
            <td>
              <div class="icon-preview" [style.background-color]="category.themeColor + '33'">
                <img [src]="category.iconUrl || '/assets/icons/default.svg'" alt="icon" onerror="this.src='/assets/icons/table-tennis.svg'">
              </div>
            </td>
            <td class="font-bold">{{ category.name }}</td>
            <td class="text-secondary">{{ category.description }}</td>
            <td>
              <div class="color-indicator">
                <span class="color-dot" [style.background-color]="category.themeColor"></span>
                {{ category.themeColor }}
              </div>
            </td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (onClick)="navigateToEdit(category.id)" [style]="{'margin-right': '0.5rem'}"></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="deleteCategory(category)"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4 text-secondary">No Game Categories found. Try adding one!</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.5rem 0.75rem;
    }
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      padding: 0.5rem 0.75rem;
    }
    :host ::ng-deep .p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
      background-color: #f3f4f6;
    }

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
      }
    }

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

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-secondary { color: var(--text-muted); }
    .font-bold { font-weight: 600; color: var(--text-primary); }

    .table-caption {
      display: flex;
      justify-content: flex-end;
      padding: 0.5rem 0;
    }

    .flex-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GameCategoryListComponent {
  private categorySvc = inject(GameCategoryService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  categories$: Observable<GameCategory[]> = this.categorySvc.categories$;

  navigateToAdd(): void {
    this.router.navigate(['/categories/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/categories/edit', id]);
  }

  deleteCategory(category: GameCategory): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the "${category.name}" category?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.categorySvc.deleteCategory(category.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Record deleted successfully' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete category' });
          }
        });
      }
    });
  }
}
