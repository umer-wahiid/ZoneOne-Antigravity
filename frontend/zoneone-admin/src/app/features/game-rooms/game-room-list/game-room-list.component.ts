import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GameRoomService } from '../../../core/services/game-room.service';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { GameRoom } from '../../../core/models/game-room.model';
import { GameCategory } from '../../../core/models/game-category.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-room-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="list-container p-4">
      <div class="list-header flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="page-title text-4xl font-bold mb-1">Game Rooms / Tables</h1>
          <p class="page-subtitle text-600">Manage rooms and tables for each gaming category</p>
        </div>
        <p-button label="Add New Room" icon="pi pi-plus" (onClick)="showDialog()"></p-button>
      </div>

      <p-table #dt [value]="(rooms$ | async) || []" [tableStyle]="{ 'min-width': '60rem' }" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="false"
               [globalFilterFields]="['roomNo', 'gameCategoryName']"
               styleClass="p-datatable-sm p-datatable-striped">
        <ng-template pTemplate="caption">
          <div class="flex justify-content-end">
            <p-iconField iconPosition="left">
              <p-inputIcon styleClass="pi pi-search" />
              <input pInputText type="text" #filter (input)="dt.filterGlobal(filter.value, 'contains')" placeholder="Search rooms..." />
            </p-iconField>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="roomNo">
              <div class="flex align-items-center gap-2">Room / Table No. <p-sortIcon field="roomNo"></p-sortIcon>
                <p-columnFilter type="text" field="roomNo" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="gameCategoryName">
              <div class="flex align-items-center gap-2">Category <p-sortIcon field="gameCategoryName"></p-sortIcon>
                <p-columnFilter type="text" field="gameCategoryName" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="maxPlayers">
              <div class="flex align-items-center gap-2">Max Players <p-sortIcon field="maxPlayers"></p-sortIcon></div>
            </th>
            <th pSortableColumn="ratePerHour">
              <div class="flex align-items-center gap-2">Rate / Hour <p-sortIcon field="ratePerHour"></p-sortIcon></div>
            </th>
            <th pSortableColumn="ratePerExtraPerson">
              <div class="flex align-items-center gap-2">Extra Person Rate <p-sortIcon field="ratePerExtraPerson"></p-sortIcon></div>
            </th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-room>
          <tr>
            <td class="font-bold">{{ room.roomNo }}</td>
            <td>{{ room.gameCategoryName }}</td>
            <td>{{ room.maxPlayers }}</td>
            <td class="font-bold text-primary">{{ room.ratePerHour | currency:'PKR ':'symbol':'1.0-0' }}</td>
            <td class="font-bold text-600">{{ room.ratePerExtraPerson | currency:'PKR ':'symbol':'1.0-0' }}</td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (onClick)="editRoom(room)" [style]="{'margin-right': '0.5rem'}"></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="deleteRoom(room)"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4 text-500">No rooms found. Try adding one!</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Room Form Dialog -->
      <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Edit Room / Table' : 'Add New Room / Table'" 
                [modal]="true" [style]="{width: '550px'}" styleClass="p-fluid shadow-6"
                [draggable]="false" [resizable]="false" [dismissableMask]="true">
        <form [formGroup]="roomForm" (ngSubmit)="saveRoom()" class="flex flex-column gap-3 mt-3">
          
          <div class="flex gap-4">
            <div class="field flex-1">
              <label for="roomNo" class="font-bold block mb-2 text-secondary">Room/Table No.</label>
              <input pInputText id="roomNo" formControlName="roomNo" placeholder="e.g. TT-01" class="w-full" />
              <small *ngIf="f['roomNo'].invalid && f['roomNo'].touched" class="text-red-400">
                Room No. is required.
              </small>
            </div>

            <div class="field flex-1">
              <label for="gameCategoryId" class="font-bold block mb-2 text-secondary">Gaming Category</label>
              <p-select id="gameCategoryId" formControlName="gameCategoryId"
                       [options]="categories()" optionLabel="name" optionValue="id"
                       placeholder="Select a category" appendTo="body" class="w-full"></p-select>
              <small *ngIf="f['gameCategoryId'].invalid && f['gameCategoryId'].touched" class="text-red-400">
                Category is required.
              </small>
            </div>
          </div>

          <div class="field">
            <label for="maxPlayers" class="font-bold block mb-2 text-secondary">No. of People Allowed</label>
            <p-inputNumber id="maxPlayers" formControlName="maxPlayers" [min]="1" [showButtons]="true" styleClass="w-full"></p-inputNumber>
          </div>

          <div class="flex gap-4">
            <div class="field flex-1">
              <label for="ratePerHour" class="font-bold block mb-2 text-secondary">Rate per Hour (PKR)</label>
              <p-inputNumber id="ratePerHour" formControlName="ratePerHour" mode="currency" currency="PKR" locale="en-PK" styleClass="w-full"></p-inputNumber>
            </div>

            <div class="field flex-1">
              <label for="ratePerExtraPerson" class="font-bold block mb-2 text-secondary">Extra Person Rate</label>
              <p-inputNumber id="ratePerExtraPerson" formControlName="ratePerExtraPerson" mode="currency" currency="PKR" locale="en-PK" styleClass="w-full"></p-inputNumber>
            </div>
          </div>

          <div class="flex justify-content-end gap-2 mt-4">
            <p-button label="Cancel" icon="pi pi-times" (onClick)="displayDialog = false" 
                     styleClass="p-button-text p-button-secondary"></p-button>
            <p-button label="Save" icon="pi pi-check" type="submit" [loading]="submitting()"
                     [disabled]="roomForm.invalid" styleClass="p-button-theme"></p-button>
          </div>
        </form>
      </p-dialog>

      <p-confirmDialog header="Delete Confirmation" icon="pi pi-exclamation-triangle"></p-confirmDialog>
    </div>
  `,
  styles: [`
    .list-container {
      animation: fadeIn 0.3s ease-out;
    }
    .text-right { text-align: right; }
    .text-secondary { color: #475569; }
    .text-red-400 { color: #ef4444; }
    .text-primary { color: #055a87; }

    ::ng-deep {
      .p-button-theme {
        background: #055a87 !important;
        border-color: #055a87 !important;
        
        &:hover {
          background: #044a6e !important;
          border-color: #044a6e !important;
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GameRoomListComponent implements OnInit {
  private roomSvc = inject(GameRoomService);
  private categorySvc = inject(GameCategoryService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  rooms$: Observable<GameRoom[]> = this.roomSvc.rooms$;
  categories = signal<GameCategory[]>([]);
  
  displayDialog = false;
  isEditMode = false;
  selectedRoomId: string | null = null;
  submitting = signal(false);

  roomForm = this.fb.group({
    roomNo: ['', Validators.required],
    gameCategoryId: ['', Validators.required],
    maxPlayers: [2, Validators.required],
    ratePerHour: [0, Validators.required],
    ratePerExtraPerson: [0]
  });

  get f() { return this.roomForm.controls; }

  ngOnInit() {
    this.categorySvc.getCategoriesFromApi().subscribe(cats => {
      this.categories.set(cats);
    });
  }

  showDialog() {
    this.isEditMode = false;
    this.selectedRoomId = null;
    this.roomForm.reset({ 
        maxPlayers: 2, 
        ratePerHour: 0, 
        ratePerExtraPerson: 0 
    });
    this.displayDialog = true;
  }

  editRoom(room: GameRoom) {
    this.isEditMode = true;
    this.selectedRoomId = room.id;
    this.roomForm.patchValue({
      roomNo: room.roomNo,
      gameCategoryId: room.gameCategoryId,
      maxPlayers: room.maxPlayers,
      ratePerHour: room.ratePerHour,
      ratePerExtraPerson: room.ratePerExtraPerson
    });
    this.displayDialog = true;
  }

  saveRoom() {
    if (this.roomForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.roomForm.value;

    if (this.isEditMode && this.selectedRoomId) {
      this.roomSvc.updateRoom(this.selectedRoomId, formValue as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room updated!' });
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update room.' });
          this.submitting.set(false);
        }
      });
    } else {
      this.roomSvc.addRoom(formValue as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room created!' });
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create room.' });
          this.submitting.set(false);
        }
      });
    }
  }

  deleteRoom(room: GameRoom): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete room "${room.roomNo}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.roomSvc.deleteRoom(room.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Room deleted successfully' }),
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete room' })
        });
      }
    });
  }
}
