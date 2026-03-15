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
import { InputTextModule } from 'primeng/inputtext';

// Services & Models
import { GameCategoryService } from '../../core/services/game-category.service';
import { GameRoomService } from '../../core/services/game-room.service';
import { SessionService } from '../../core/services/session.service';
import { GameCategory } from '../../core/models/game-category.model';
import { GameRoom } from '../../core/models/game-room.model';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

export interface CartItem {
  id: string;
  category: GameCategory;
  room: GameRoom;
  startTime: Date;
  endTime: Date;
  numberOfPersons: number;
  calculatedPrice: number;
}

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
    DatePickerModule,
    InputTextModule
  ],
  template: `
  <div class="dashboard-wrapper scalein animation-duration-300">
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold m-0 p-0 text-900">Dashboard POS</h1>
        <p class="text-500 mt-1">Book multiple tables, rooms, or slots into a single cart checkout.</p>
      </div>
    </div>

    <!-- PrimeFlex Two Column Layout -->
    <div class="grid">
      <!-- Left Column (8) -->
      <div class="col-12 lg:col-8">
        <!-- Top Box: Categories -->
        <div class="surface-card p-4 border-round shadow-2 mb-4">
          <div class="grid">
            <div class="col-12 sm:col-4 md:col-3" *ngFor="let cat of categories()">
              <div 
                class="surface-100 p-3 border-round shadow-1 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-3 flex flex-column align-items-center justify-content-center text-center h-7rem border-2 border-transparent"
                [class.border-primary]="selectedCategory()?.id === cat.id"
                [class.surface-hover]="selectedCategory()?.id === cat.id"
                [class.bg-blue-50]="selectedCategory()?.id === cat.id"
                (click)="onCategorySelect(cat)">
                <i class="pi pi-tags text-2xl text-primary mb-2"></i>
                <div class="font-bold">{{ cat.name }}</div>
              </div>
            </div>
          </div>
          <div *ngIf="categories().length === 0" class="text-500 py-2">Loading categories...</div>
        </div>

        <!-- Bottom Box: Rooms/Tables -->
        <div class="surface-card p-4 border-round shadow-2" *ngIf="selectedCategory()">
          <div class="grid">
            <div class="col-12 sm:col-4 md:col-3" *ngFor="let room of filteredRooms()">
              <div 
                class="surface-100 p-3 border-round shadow-1 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-3 flex flex-column align-items-center justify-content-center text-center h-8rem border-2 border-transparent relative"
                [class.border-primary]="selectedRoom()?.id === room.id && !editingCartItemId()"
                [class.bg-blue-50]="selectedRoom()?.id === room.id && !editingCartItemId()"
                (click)="onRoomSelect(room)">
                <div class="absolute top-0 right-0 p-2 text-xs font-semibold text-500" title="Max Persons">
                  <i class="pi pi-users mr-1"></i>{{ room.maxPlayers }}
                </div>
                <div class="text-3xl font-bold text-primary mb-1">{{ room.roomNo }}</div>
                <div class="text-600 font-medium text-sm">{{ room.ratePerHour | currency:'PKR ':'symbol':'1.0-0' }} / hr</div>
              </div>
            </div>
            <div *ngIf="filteredRooms().length === 0" class="col-12 text-center p-3 text-500">
              No rooms available for this category.
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column (Cart Panel) -->
      <div class="col-12 lg:col-4">
        <div class="surface-card p-4 border-round shadow-2 h-full flex flex-column">
          <div class="text-xl font-semibold mb-3 flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-shopping-cart text-green-500"></i> Current Cart
            </div>
            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" *ngIf="cartItems().length > 0" (onClick)="clearCart()" pTooltip="Clear List"></p-button>
          </div>
          
          <div class="flex-1 overflow-auto">
            <p-table [value]="cartItems()" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  <th>Room</th>
                  <th>Price</th>
                  <th class="w-4rem text-center"></th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>
                    <div class="font-bold text-900">{{ item.room.roomNo }}</div>
                    <div class="text-xs text-500">{{ item.category.name }} ({{ item.numberOfPersons }}p)</div>
                  </td>
                  <td>
                    <div class="text-sm font-medium">{{ item.startTime | date:'shortTime' }} - {{ item.endTime | date:'shortTime' }}</div>
                    <div class="text-sm font-bold text-green-600">{{ item.calculatedPrice | currency:'PKR ':'symbol':'1.0-0' }}</div>
                  </td>
                  <td class="text-center p-0">
                    <div class="flex flex-column gap-1">
                      <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" size="small" (onClick)="editCartItem(item)"></p-button>
                      <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" size="small" (onClick)="removeCartItem(item.id)"></p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="3" class="text-center text-500 p-4">No rooms added yet.</td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <!-- Customer Profile -->
          <div class="mt-3" *ngIf="cartItems().length > 0">
              <div class="flex flex-column gap-2 mb-2">
                  <span class="p-input-icon-left w-full">
                      <i class="pi pi-user"></i>
                      <input type="text" pInputText placeholder="Customer Name" class="w-full" [(ngModel)]="customerName">
                  </span>
              </div>
              <div class="flex flex-column gap-2">
                  <span class="p-input-icon-left w-full">
                      <i class="pi pi-phone"></i>
                      <input type="text" pInputText placeholder="Contact Phone" class="w-full" [(ngModel)]="customerPhone">
                  </span>
              </div>
          </div>

          <!-- Checkout Footer -->
          <div class="mt-3 pt-3 border-top-1 border-300">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-xl font-semibold text-700">Grand Total</span>
              <span class="text-2xl font-bold text-green-600">{{ grandTotal() | currency:'PKR ':'symbol':'1.0-0' }}</span>
            </div>
            <p-button label="Checkout Booking" icon="pi pi-check" severity="success" styleClass="w-full p-3 font-bold text-lg" (onClick)="checkoutCart()" [disabled]="cartItems().length === 0 || !customerName.trim()"></p-button>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Session Dialog -->
  <p-dialog [header]="editingCartItemId() ? 'Update Selected Slot' : 'New Slot Booking'" [modal]="true" [(visible)]="showDialog" [style]="{ width: '450px' }" (onHide)="cancelSelection()">
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
      <div class="flex justify-content-end w-full gap-2">
        <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="showDialog = false"></p-button>
        <p-button [label]="editingCartItemId() ? 'Update Cart' : 'Add to Cart'" icon="pi pi-plus" (onClick)="addToCart()" [disabled]="sessionForm.invalid || calculatedPrice() === null"></p-button>
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

  // Cart state
  cartItems = signal<CartItem[]>([]);
  editingCartItemId = signal<string | null>(null);

  // Customer Profile
  customerName = '';
  customerPhone = '';

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
    return this.cartItems().reduce((acc, item) => acc + item.calculatedPrice, 0);
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

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.catSvc.categories$.pipe(takeUntil(this.destroy$)).subscribe((c: GameCategory[]) => this.categories.set(c));
    this.roomSvc.rooms$.pipe(takeUntil(this.destroy$)).subscribe((r: GameRoom[]) => this.rooms.set(r));

    // Explicitly refetch on dashboard mount so the cache gets updated if they changed screens
    this.catSvc.getCategoriesFromApi().subscribe(c => (this.catSvc as any)['categoriesSubject'].next(c));
    (this.roomSvc as any)['refreshRooms']();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.sessionForm = this.fb.group({
      numberOfPersons: [2, Validators.required],
      startTime: [new Date(), Validators.required],
      endTime: [new Date(new Date().getTime() + 60 * 60 * 1000), Validators.required] // +1 hour default
    });

    // Auto-calculate logic
    this.sessionForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(400) // Debounce so we aren't spamming API on fast typing
    ).subscribe(() => {
      this.calculatePrice();
    });
  }

  onCategorySelect(category: GameCategory) {
    this.selectedCategory.set(category);
    this.selectedRoom.set(null); // Reset room when category shifts
    this.editingCartItemId.set(null);
  }

  onRoomSelect(room: GameRoom) {
    this.editingCartItemId.set(null);
    this.selectedRoom.set(room);
    this.calculatedPrice.set(null); // Reset old calculations

    // Reset form to defaults based on room capacity
    const capacity = room.maxPlayers > 0 ? room.maxPlayers : 2;
    this.sessionForm.patchValue({
      numberOfPersons: capacity,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000)
    });

    // Trigger initial calculation
    this.calculatePrice();

    this.showDialog = true;
  }

  editCartItem(item: CartItem) {
    this.editingCartItemId.set(item.id);
    this.selectedCategory.set(item.category);
    this.selectedRoom.set(item.room);
    this.calculatedPrice.set(item.calculatedPrice);

    this.sessionForm.patchValue({
      numberOfPersons: item.numberOfPersons,
      startTime: item.startTime,
      endTime: item.endTime
    });

    this.showDialog = true;
  }

  removeCartItem(id: string) {
    this.cartItems.update(items => items.filter(i => i.id !== id));
  }

  clearCart() {
    this.cartItems.set([]);
    this.customerName = '';
    this.customerPhone = '';
  }

  cancelSelection() {
    // Run when dialog hides without confirming
    this.selectedRoom.set(null);
    this.editingCartItemId.set(null);
  }

  calculatePrice() {
    const room = this.selectedRoom();
    if (this.sessionForm.invalid || !room) {
      this.calculatedPrice.set(null);
      return;
    }

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
      },
      error: (err) => {
        this.calculatedPrice.set(null);
      }
    });
  }

  addToCart() {
    const room = this.selectedRoom();
    const cat = this.selectedCategory();
    const price = this.calculatedPrice();

    if (this.sessionForm.invalid || !room || !cat || price === null) return;

    const val = this.sessionForm.value;
    const newItem: CartItem = {
      id: this.editingCartItemId() ? this.editingCartItemId()! : Math.random().toString(36).substring(2, 9),
      category: cat,
      room: room,
      startTime: val.startTime as Date,
      endTime: val.endTime as Date,
      numberOfPersons: val.numberOfPersons,
      calculatedPrice: price
    };

    if (this.editingCartItemId()) {
      this.cartItems.update(items => items.map(i => i.id === newItem.id ? newItem : i));
      this.messageSvc.add({ severity: 'success', summary: 'Updated', detail: 'Slot updated in cart' });
    } else {
      this.cartItems.update(items => [...items, newItem]);
      this.messageSvc.add({ severity: 'success', summary: 'Added', detail: 'Slot added to cart' });
    }

    this.showDialog = false;
    this.selectedRoom.set(null);
    this.editingCartItemId.set(null);
  }

  checkoutCart() {
    if (this.cartItems().length === 0 || !this.customerName.trim()) {
       this.messageSvc.add({ severity: 'warn', summary: 'Missing Info', detail: 'Please provide Customer Name and add slots to cart.' });
       return;
    }

    const payload = {
       customerName: this.customerName,
       customerPhone: this.customerPhone,
       paymentStatus: 'Paid', // Assuming POS cash register checkout is immediate Paid
       items: this.cartItems().map(item => ({
          gameRoomId: item.room.id,
          gameCategoryId: item.category.id,
          startTime: item.startTime.toISOString(),
          endTime: item.endTime.toISOString(),
          numberOfPersons: item.numberOfPersons
       }))
    };

    this.sessionSvc.checkoutBooking(payload).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Booking Finalized', detail: 'Ticket completely saved!' });
        this.clearCart();
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Checkout Failed', detail: err.error?.message || 'Failed to submit booking.' });
      }
    });
  }
}
