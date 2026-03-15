import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameRoomService } from '../../../core/services/game-room.service';
import { GameRoom } from '../../../core/models/game-room.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-room-list',
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
          <h1 class="page-title">Game Rooms / Tables</h1>
          <p class="page-subtitle">Manage rooms and tables for each gaming category</p>
        </div>
        <p-button label="Add New Room" icon="pi pi-plus" (onClick)="navigateToAdd()"></p-button>
      </div>

      <p-table #dt [value]="(rooms$ | async) || []" [tableStyle]="{ 'min-width': '60rem' }" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="true" [stripedRows]="true"
               [globalFilterFields]="['roomNo', 'gameCategoryName']">
        <ng-template pTemplate="caption">
          <div class="table-caption">
            <p-iconField iconPosition="left">
              <p-inputIcon styleClass="pi pi-search" />
              <input pInputText type="text" #filter (input)="dt.filterGlobal(filter.value, 'contains')" placeholder="Search rooms..." />
            </p-iconField>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="roomNo">
              <div class="flex-header">Room / Table No. <p-sortIcon field="roomNo"></p-sortIcon>
                <p-columnFilter type="text" field="roomNo" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="gameCategoryName">
              <div class="flex-header">Category <p-sortIcon field="gameCategoryName"></p-sortIcon>
                <p-columnFilter type="text" field="gameCategoryName" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="maxPlayers">
              <div class="flex-header">Max Players <p-sortIcon field="maxPlayers"></p-sortIcon></div>
            </th>
            <th pSortableColumn="ratePerHour">
              <div class="flex-header">Rate / Hour <p-sortIcon field="ratePerHour"></p-sortIcon></div>
            </th>
            <th pSortableColumn="ratePerExtraPerson">
              <div class="flex-header">Extra Person Rate <p-sortIcon field="ratePerExtraPerson"></p-sortIcon></div>
            </th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-room>
          <tr>
            <td class="font-bold">{{ room.roomNo }}</td>
            <td>{{ room.gameCategoryName }}</td>
            <td>{{ room.maxPlayers }}</td>
            <td>{{ room.ratePerHour | currency:'PKR ':'symbol':'1.0-0' }}</td>
            <td>{{ room.ratePerExtraPerson | currency:'PKR ':'symbol':'1.0-0' }}</td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (onClick)="navigateToEdit(room.id)" [style]="{'margin-right': '0.5rem'}"></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="deleteRoom(room)"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4 text-secondary">No rooms found. Try adding one!</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
    styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td { padding: 0.5rem 0.75rem; }
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th { padding: 0.5rem 0.75rem; }
    :host ::ng-deep .p-datatable-striped .p-datatable-tbody > tr:nth-child(even) { background-color: #f3f4f6; }

    .list-container { animation: fadeIn 0.3s ease-in-out; }
    .list-header {
      display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;
      .page-title { font-size: 2.5rem; margin-bottom: 0.25rem; }
      .page-subtitle { color: var(--text-muted); }
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-secondary { color: var(--text-muted); }
    .font-bold { font-weight: 600; color: var(--text-primary); }
    .table-caption { display: flex; justify-content: flex-end; padding: 0.5rem 0; }
    .flex-header { display: flex; align-items: center; gap: 0.5rem; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class GameRoomListComponent {
    private roomSvc = inject(GameRoomService);
    private router = inject(Router);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    rooms$: Observable<GameRoom[]> = this.roomSvc.rooms$;

    navigateToAdd(): void {
        this.router.navigate(['/rooms/new']);
    }

    navigateToEdit(id: string): void {
        this.router.navigate(['/rooms/edit', id]);
    }

    deleteRoom(room: GameRoom): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete room "${room.roomNo}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.roomSvc.deleteRoom(room.id).subscribe({
                    next: () => this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Room deleted successfully' }),
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete room' })
                });
            }
        });
    }
}
