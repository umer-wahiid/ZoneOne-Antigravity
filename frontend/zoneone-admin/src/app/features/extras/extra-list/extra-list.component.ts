import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExtraService } from '../../../core/services/extra.service';
import { Extra } from '../../../core/models/extra.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-extra-list',
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
    <div class="list-container p-4">
      <div class="list-header flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="text-4xl font-bold mb-1">Extras & Inventory</h1>
          <p class="text-600">Cold drinks, snacks, and other items</p>
        </div>
        <p-button label="Add Extra Item" icon="pi pi-plus" (onClick)="navigateToAdd()"></p-button>
      </div>

      <p-table #dt [value]="(extras$ | async) || []" [tableStyle]="{ 'min-width': '50rem' }" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="true" [stripedRows]="true"
               [globalFilterFields]="['name']">
        <ng-template pTemplate="caption">
            <div class="flex justify-content-end">
                <p-iconField iconPosition="left">
                    <p-inputIcon styleClass="pi pi-search" />
                    <input pInputText type="text" #filter (input)="dt.filterGlobal(filter.value, 'contains')" placeholder="Search items..." />
                </p-iconField>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">
              <div class="flex align-items-center gap-2">
                Item Name <p-sortIcon field="name"></p-sortIcon>
              </div>
            </th>
            <th pSortableColumn="price">
              <div class="flex align-items-center gap-2">
                Price <p-sortIcon field="price"></p-sortIcon>
              </div>
            </th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-extra>
          <tr>
            <td class="font-bold text-900">{{ extra.name }}</td>
            <td class="text-primary font-bold">{{ extra.price | currency:'PKR ':'symbol':'1.0-0' }}</td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (onClick)="navigateToEdit(extra.id)" [style]="{'margin-right': '0.5rem'}"></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="deleteExtra(extra)"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3" class="text-center p-4 text-500">No extras found. Add some items like Cold Drinks or Tea!</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .list-container {
      animation: fadeIn 0.3s ease-out;
    }
    .text-right { text-align: right; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ExtraListComponent {
  private extraSvc = inject(ExtraService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  extras$: Observable<Extra[]> = this.extraSvc.extras$;

  navigateToAdd(): void {
    this.router.navigate(['/extras/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/extras/edit', id]);
  }

  deleteExtra(extra: Extra): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${extra.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.extraSvc.deleteExtra(extra.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item deleted successfully' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete item' });
          }
        });
      }
    });
  }
}
