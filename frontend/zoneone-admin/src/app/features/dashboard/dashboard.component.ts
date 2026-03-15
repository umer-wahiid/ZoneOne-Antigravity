import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG
import { ListboxModule } from 'primeng/listbox';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

// Services & Models
import { GameCategoryService } from '../../core/services/game-category.service';
import { GameRoomService } from '../../core/services/game-room.service';
import { SessionService } from '../../core/services/session.service';
import { GameCategory } from '../../core/models/game-category.model';
import { GameRoom } from '../../core/models/game-room.model';
import { SessionDto } from '../../core/models/session.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ListboxModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule
  ],
  template: `
  <div class="dashboard-wrapper scalein animation-duration-300">
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold m-0 p-0 text-900">Dashboard</h1>
        <p class="text-500 mt-1">Manage walk-in customers and current sessions.</p>
      </div>
      <p-button icon="pi pi-refresh" [rounded]="true" [text]="true" (onClick)="loadActiveSessions()"></p-button>
    </div>

    <!-- PrimeFlex Two Column Layout -->
    <div class="grid">
      <!-- Left Column (8) -->
      <div class="col-12 lg:col-8">
        <!-- Top Box: Categories -->
        <div class="surface-card p-4 border-round shadow-2 mb-4">
          <div class="text-xl font-semibold mb-3">1. Select Gaming Category</div>
          <p-listbox 
            [options]="categories()" 
            [ngModel]="selectedCategory()" 
            (ngModelChange)="onCategorySelect($event)"
            optionLabel="name" 
            [listStyle]="{'max-height': '200px'}" 
            [style]="{'width':'100%'}">
            <ng-template let-cat pTemplate="item">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-tags text-primary"></i>
                <div class="font-medium">{{ cat.name }}</div>
              </div>
            </ng-template>
          </p-listbox>
          <div *ngIf="categories().length === 0" class="text-500 py-2">Loading categories...</div>
        </div>

        <!-- Bottom Box: Rooms/Tables -->
        <div class="surface-card p-4 border-round shadow-2" *ngIf="selectedCategory()">
          <div class="text-xl font-semibold mb-3">2. Select a Room / Table</div>
          <p-table [value]="filteredRooms()" selectionMode="single" [selection]="selectedRoom()" (selectionChange)="onRoomSelect($event)" [tableStyle]="{'min-width': '100%'}" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Room No.</th>
                <th>Category</th>
                <th>Capacity</th>
                <th>Rate / Hr</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-room>
              <tr [pSelectableRow]="room" class="cursor-pointer">
                <td class="font-bold text-primary">{{ room.roomNo }}</td>
                <td>{{ room.gameCategoryName }}</td>
                <td>{{ room.maxPlayers }} Persons</td>
                <td>{{ room.ratePerHour | currency:'PKR ':'symbol':'1.0-0' }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center p-3 text-500">No rooms available for this category.</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Right Column (4) -->
      <div class="col-12 lg:col-4">
        <div class="surface-card p-4 border-round shadow-2 h-full flex flex-column">
          <div class="text-xl font-semibold mb-3 flex align-items-center gap-2">
            <i class="pi pi-clock text-green-500"></i> Active Sessions
          </div>
          
          <div class="flex-1 overflow-auto">
            <p-table [value]="activeSessions()" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  <th>Room</th>
                  <th>Time</th>
                  <th class="text-right">Total</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-session>
                <tr>
                  <td>
                    <div class="font-bold text-900">{{ session.roomNo }}</div>
                    <div class="text-xs text-500">{{ session.categoryName }} ({{ session.numberOfPersons }}p)</div>
                  </td>
                  <td>
                    <div class="text-sm">{{ session.startTime | date:'shortTime' }}</div>
                    <div class="text-xs text-500">{{ session.endTime ? (session.endTime | date:'shortTime') : 'Ongoing' }}</div>
                  </td>
                  <td class="text-right font-bold text-green-600">
                    {{ session.totalAmount | currency:'PKR ':'symbol':'1.0-0' }}
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="3" class="text-center text-500 p-4">No active sessions.</td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <!-- Grand Total Footer -->
          <div class="mt-4 pt-3 border-top-1 border-300 flex justify-content-between align-items-center">
            <span class="text-xl font-semibold text-700">Grand Total</span>
            <span class="text-2xl font-bold text-green-600">{{ grandTotal() | currency:'PKR ':'symbol':'1.0-0' }}</span>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Session Dialog -->
  <p-dialog header="New Session / Booking" [modal]="true" [(visible)]="showDialog" [style]="{ width: '450px' }" (onHide)="cancelSelection()">
    <div class="flex align-items-center gap-3 mb-4 surface-100 p-3 border-round">
      <i class="pi pi-building text-2xl text-primary"></i>
      <div>
        <div class="font-bold text-xl">{{ selectedRoom()?.roomNo }}</div>
        <div class="text-500 text-sm">{{ selectedRoom()?.gameCategoryName }} • {{ selectedRoom()?.ratePerHour | currency:'PKR ' }}/hr</div>
      </div>
    </div>

    <form [formGroup]="sessionForm" class="flex flex-column gap-3">
      <div class="flex flex-column gap-2">
        <label class="font-semibold">Number of Persons</label>
        <p-inputNumber formControlName="numberOfPersons" [min]="1" [showButtons]="true" styleClass="w-full"></p-inputNumber>
      </div>

      <div class="flex flex-column gap-2">
        <label class="font-semibold">Start Time</label>
        <p-datepicker formControlName="startTime" [showTime]="true" hourFormat="12" styleClass="w-full" appendTo="body"></p-datepicker>
      </div>

      <div class="flex flex-column gap-2">
        <label class="font-semibold">End Time</label>
        <p-datepicker formControlName="endTime" [showTime]="true" hourFormat="12" styleClass="w-full" appendTo="body"></p-datepicker>
      </div>

      <!-- Preview Price Box -->
      <div *ngIf="calculatedPrice() !== null" class="mt-3 p-3 bg-green-50 border-green-200 border-1 border-round text-center">
        <div class="text-green-800 font-medium mb-1">Estimated Total</div>
        <div class="text-3xl font-bold text-green-600">{{ calculatedPrice() | currency:'PKR ':'symbol':'1.0-0' }}</div>
      </div>
    </form>

    <ng-template pTemplate="footer">
      <div class="flex justify-content-between w-full">
        <p-button label="Calculate Price" icon="pi pi-calculator" severity="info" [text]="true" (onClick)="calculatePrice()" [disabled]="sessionForm.invalid"></p-button>
        <div class="flex gap-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="showDialog = false"></p-button>
          <p-button label="Confirm & Start" icon="pi pi-check" (onClick)="startSession()" [disabled]="sessionForm.invalid"></p-button>
        </div>
      </div>
    </ng-template>
  </p-dialog>
  `,
  styles: [`
    .dashboard-wrapper { padding: 1rem; }
    .text-right { text-align: right; }
  `]
})
export class DashboardComponent implements OnInit {
  // State via Signals
  categories = signal<GameCategory[]>([]);
  rooms = signal<GameRoom[]>([]);
  activeSessions = signal<SessionDto[]>([]);

  selectedCategory = signal<GameCategory | null>(null);
  selectedRoom = signal<GameRoom | null>(null);

  calculatedPrice = signal<number | null>(null);

  // Derived State (Computed)
  filteredRooms = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return [];
    return this.rooms().filter(r => r.gameCategoryId === cat.id);
  });

  grandTotal = computed(() => {
    return this.activeSessions().reduce((acc, session) => acc + session.totalAmount, 0);
  });

  showDialog = false;
  sessionForm!: FormGroup;

  private fb = inject(FormBuilder);
  private catSvc = inject(GameCategoryService);
  private roomSvc = inject(GameRoomService);
  private sessionSvc = inject(SessionService);
  private messageSvc = inject(MessageService);

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.catSvc.getCategoriesFromApi().pipe(take(1)).subscribe(c => this.categories.set(c));
    this.roomSvc.rooms$.pipe(take(1)).subscribe(r => this.rooms.set(r));
    this.loadActiveSessions();
  }

  initForm() {
    this.sessionForm = this.fb.group({
      numberOfPersons: [2, Validators.required],
      startTime: [new Date(), Validators.required],
      endTime: [new Date(new Date().getTime() + 60 * 60 * 1000), Validators.required] // +1 hour default
    });
  }

  loadActiveSessions() {
    this.sessionSvc.getActiveSessions().pipe(take(1)).subscribe(s => this.activeSessions.set(s));
  }

  onCategorySelect(category: GameCategory) {
    this.selectedCategory.set(category);
    this.selectedRoom.set(null); // Reset room when category shifts
  }

  onRoomSelect(room: GameRoom) {
    this.selectedRoom.set(room);
    this.calculatedPrice.set(null); // Reset old calculations

    // Reset form to defaults based on room capacity
    const capacity = room.maxPlayers > 0 ? room.maxPlayers : 2;
    this.sessionForm.patchValue({
      numberOfPersons: capacity,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000)
    });

    this.showDialog = true;
  }

  cancelSelection() {
    // Run when dialog hides without confirming
    this.selectedRoom.set(null);
  }

  calculatePrice() {
    const room = this.selectedRoom();
    if (this.sessionForm.invalid || !room) return;

    const val = this.sessionForm.value;
    const payload = {
      gameRoomId: room.id,
      startTime: (val.startTime as Date).toISOString(),
      endTime: (val.endTime as Date).toISOString(),
      numberOfPersons: val.numberOfPersons
    };

    this.sessionSvc.calculateSession(payload).subscribe({
      next: (res) => {
        this.calculatedPrice.set(res.amount);
        this.messageSvc.add({ severity: 'info', summary: 'Calculated', detail: 'Pricing preview updated' });
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Calculation Failed', detail: err.error?.message || 'Error computing price' });
      }
    });
  }

  startSession() {
    const room = this.selectedRoom();
    const cat = this.selectedCategory();
    if (this.sessionForm.invalid || !room || !cat) return;

    const val = this.sessionForm.value;
    const payload = {
      gameRoomId: room.id,
      gameCategoryId: cat.id,
      startTime: (val.startTime as Date).toISOString(),
      endTime: (val.endTime as Date).toISOString(),
      numberOfPersons: val.numberOfPersons
    };

    this.sessionSvc.startSession(payload).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Success', detail: 'Session booking finalized!' });
        this.showDialog = false;
        this.selectedRoom.set(null);

        // Immediately refresh active sessions so computation updates Grand Total mapping
        this.loadActiveSessions();
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Booking Failed', detail: err.error?.message || 'Could not save session' });
      }
    });
  }
}
