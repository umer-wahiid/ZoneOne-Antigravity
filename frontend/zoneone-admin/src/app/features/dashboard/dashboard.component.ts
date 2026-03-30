import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// PrimeNG
import { ListboxModule } from 'primeng/listbox';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Services & Models
import { GameCategoryService } from '../../core/services/game-category.service';
import { GameRoomService } from '../../core/services/game-room.service';
import { SessionService } from '../../core/services/session.service';
import { ExtraService } from '../../core/services/extra.service';
import { GameCategory } from '../../core/models/game-category.model';
import { GameRoom } from '../../core/models/game-room.model';
import { Extra } from '../../core/models/extra.model';
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
  discountAmount?: number;
}

export interface ExtraCartItem {
  id: string;
  extra: Extra;
  quantity: number;
  totalPrice: number;
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
    InputTextModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
  <div class="dashboard-wrapper scalein animation-duration-300 w-full">
    <!-- Top Bar -->
    <div class="surface-card p-3 border-round shadow-2 w-full flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
      <div class="flex align-items-center gap-2">
        <p-button label="All Bookings" icon="pi pi-list" severity="secondary" (onClick)="openBookingsDialog()"></p-button>
      </div>
      <div class="flex flex-wrap align-items-center gap-2">
        <input pInputText type="text" placeholder="Customer Name" [(ngModel)]="customerName" style="width: 220px;" />
        <input pInputText type="text" placeholder="Customer Phone" [(ngModel)]="customerPhone" style="width: 160px;" />
        <p-button label="Extras" icon="pi pi-box" severity="info" (onClick)="openExtrasDialog()"></p-button>
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
                class="surface-100 p-3 border-round shadow-1 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-3 flex flex-column align-items-center justify-content-center text-center h-7rem border-2 border-transparent relative"
                [class.border-primary]="selectedCategory()?.id === cat.id"
                [style.background-color]="selectedCategory()?.id === cat.id ? 'rgba(5, 90, 135, 0.1)' : ''"
                (click)="onCategorySelect(cat)">
                <i class="pi pi-clock absolute top-0 right-0 m-2 text-500 hover:text-primary transition-colors cursor-pointer p-2 border-circle hover:surface-200" title="View Bookings" (click)="openCategoryBookings(cat, $event)"></i>
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
                [style.background-color]="selectedRoom()?.id === room.id && !editingCartItemId() ? 'rgba(5, 90, 135, 0.1)' : ''"
                (click)="onRoomSelect(room)">
                <i class="pi pi-clock absolute top-0 right-0 m-2 text-500 hover:text-primary transition-colors cursor-pointer p-2 border-circle hover:surface-200" title="View Room Bookings" (click)="openRoomBookings(room, $event)"></i>
                <div class="absolute top-0 left-0 p-2 text-xs font-semibold text-500" title="Max Persons">
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
              <i class="pi pi-shopping-cart" style="color: #055a87;"></i> Current Cart
            </div>
            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" *ngIf="cartItems().length > 0" (onClick)="clearCart()" pTooltip="Clear List"></p-button>
          </div>
          
          <div class="flex-1 overflow-auto">
            <p-table [value]="cartItems()" dataKey="id" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped">
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
                    <div class="mt-2 flex align-items-center gap-2">
                       <span class="text-xs text-500 font-semibold" pTooltip="Slot Discount">Disc:</span>
                       <p-inputNumber [ngModel]="item.discountAmount || 0" (ngModelChange)="updateDiscount(item.id, $event)" [min]="0" [max]="item.calculatedPrice" styleClass="w-full max-w-5rem" inputStyleClass="w-full text-center text-sm p-1" mode="currency" currency="PKR" locale="en-PK"></p-inputNumber>
                    </div>
                  </td>
                  <td>
                    <div class="text-sm font-medium mb-1">{{ item.startTime | date:'shortTime' }} - {{ item.endTime | date:'shortTime' }}</div>
                    <div class="text-xs font-semibold text-500 line-through" *ngIf="item.discountAmount">{{ item.calculatedPrice | currency:'PKR ':'symbol':'1.0-0' }}</div>
                    <div class="text-sm font-bold" style="color: #055a87;">{{ (item.calculatedPrice - (item.discountAmount || 0)) | currency:'PKR ':'symbol':'1.0-0' }}</div>
                  </td>
                  <td class="text-center p-0">
                    <div class="flex flex-column gap-1">
                      <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" size="small" (onClick)="editCartItem(item)"></p-button>
                      <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" size="small" (onClick)="removeCartItem(item.id)"></p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="mt-3" *ngIf="cartExtras().length > 0">
              <div class="text-sm font-semibold text-500 mb-2 uppercase tracking-wider">Extras</div>
              <p-table [value]="cartExtras()" dataKey="id" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped">
                <ng-template pTemplate="header">
                  <tr *ngIf="cartExtras().length > 0">
                    <th>Item</th>
                    <th>Price</th>
                    <th class="w-4rem text-center"></th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-ex>
                  <tr>
                    <td>
                      <div class="font-bold text-900">{{ ex.extra.name }}</div>
                      <div class="text-xs text-500">{{ ex.quantity }} x {{ ex.extra.price | currency:'PKR ':'symbol':'1.0-0' }}</div>
                    </td>
                    <td>
                      <div class="text-sm font-bold" style="color: #055a87;">{{ ex.totalPrice | currency:'PKR ':'symbol':'1.0-0' }}</div>
                    </td>
                    <td class="text-center w-4rem p-0">
                      <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" size="small" (onClick)="removeExtraItem(ex.id)"></p-button>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>

          <!-- Checkout Footer -->
          <div class="mt-3 pt-3 border-top-1 border-300">
            <div class="flex justify-content-between align-items-center mb-2">
              <span class="text-xl font-semibold text-700">Grand Total</span>
              <span class="text-2xl font-bold" style="color: #055a87;">{{ grandTotal() | currency:'PKR ':'symbol':'1.0-0' }}</span>
            </div>

            <!-- Payment Fields -->
            <div class="flex flex-column gap-2 mb-3" *ngIf="cartItems().length > 0">
              <div class="flex align-items-center justify-content-between gap-2">
                <label class="text-600 font-medium white-space-nowrap">Cash Received</label>
                <p-inputNumber [ngModel]="cashReceived()" (ngModelChange)="cashReceived.set($event)" [min]="0" mode="currency" currency="PKR" locale="en-PK"
                  styleClass="w-full" inputStyleClass="text-right font-bold"></p-inputNumber>
              </div>
              <div class="flex align-items-center justify-content-between surface-100 border-round p-2">
                <span class="text-600 font-medium">Remaining</span>
                <span class="font-bold text-lg" [class.text-red-500]="cashRemaining() > 0" [style.color]="cashRemaining() <= 0 ? '#055a87' : ''">
                  {{ cashRemaining() | currency:'PKR ':'symbol':'1.0-0' }}
                </span>
              </div>
            </div>

            <div class="flex flex-column gap-2">
              <p-button [label]="editingBookingId() ? 'Update Ticket' : 'Checkout Booking'" [icon]="editingBookingId() ? 'pi pi-save' : 'pi pi-check'" severity="success" styleClass="w-full p-3 font-bold text-lg" (onClick)="checkoutCart()" [disabled]="(cartItems().length === 0 && cartExtras().length === 0) || !customerName.trim()"></p-button>
              
              <p-button *ngIf="cashReceived() === grandTotal()" label="Print & Checkout" icon="pi pi-print" severity="info" styleClass="w-full p-3 font-bold text-lg" (onClick)="checkoutCart(true)" [disabled]="(cartItems().length === 0 && cartExtras().length === 0) || !customerName.trim()"></p-button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Session Dialog -->
  <p-dialog [header]="editingCartItemId() ? 'Update Selected Slot' : 'New Slot Booking'" [modal]="true" [(visible)]="showDialog" [style]="{ width: '450px' }" (onHide)="cancelSelection()" [dismissableMask]="true">
    <div class="flex align-items-center gap-3 mb-3 surface-100 p-2 border-round">
      <i class="pi pi-building text-2xl text-primary"></i>
      <div>
        <div class="font-bold text-lg">{{ selectedRoom()?.roomNo }}</div>
        <div class="text-500 text-xs">{{ selectedRoom()?.gameCategoryName }} • {{ selectedRoom()?.ratePerHour | currency:'PKR ' }}/hr</div>
      </div>
    </div>

    <form [formGroup]="sessionForm" class="flex flex-column gap-3">
      <div class="flex flex-column gap-1">
        <label class="font-semibold text-sm">Number of Persons</label>
        <p-inputNumber formControlName="numberOfPersons" [min]="1" [showButtons]="true" styleClass="w-full"></p-inputNumber>
      </div>

      <div class="flex gap-3">
        <div class="flex flex-column gap-1 flex-1">
          <label class="font-semibold text-sm">Start Time</label>
          <p-datepicker formControlName="startTime" [showTime]="true" hourFormat="12" styleClass="w-full" appendTo="body"></p-datepicker>
        </div>

        <div class="flex flex-column gap-1 flex-1">
          <label class="font-semibold text-sm">End Time</label>
          <p-datepicker formControlName="endTime" [showTime]="true" hourFormat="12" styleClass="w-full" appendTo="body"></p-datepicker>
        </div>
      </div>

      <!-- Preview Price Box -->
      <div *ngIf="calculatedPrice() !== null" class="mt-1 p-2 border-1 border-round text-center" style="background-color: rgba(5, 90, 135, 0.05); border-color: rgba(5, 90, 135, 0.2);">
        <div class="font-medium text-sm" style="color: #055a87;">Estimated Total</div>
        <div class="text-2xl font-bold" style="color: #055a87;">{{ calculatedPrice() | currency:'PKR ':'symbol':'1.0-0' }}</div>
      </div>
    </form>

    <ng-template pTemplate="footer">
      <div class="flex justify-content-end w-full gap-2">
        <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="showDialog = false"></p-button>
        <p-button [label]="editingCartItemId() ? 'Update Cart' : 'Add to Cart'" icon="pi pi-plus" (onClick)="addToCart()" [disabled]="sessionForm.invalid || calculatedPrice() === null"></p-button>
      </div>
    </ng-template>
  </p-dialog>

  <!-- All Bookings Dialog -->
  <p-dialog header="Booking History" [modal]="true" [(visible)]="showBookingsDialog" [style]="{ width: '80vw' }" [maximizable]="true" [dismissableMask]="true">
    <p-table #dtBookings [value]="bookingsList()" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped" 
             [paginator]="true" [rows]="10" [globalFilterFields]="['id', 'customerName', 'customerPhone', 'paymentStatus']">
      <ng-template pTemplate="caption">
          <div class="flex justify-content-end">
              <p-iconField iconPosition="left">
                  <p-inputIcon styleClass="pi pi-search" />
                  <input pInputText type="text" #filter (input)="dtBookings.filterGlobal(filter.value, 'contains')" 
                         placeholder="Global Search..." />
              </p-iconField>
          </div>
      </ng-template>
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="customerName">
            <div class="flex align-items-center gap-1">Customer <p-sortIcon field="customerName"></p-sortIcon> <p-columnFilter type="text" field="customerName" display="menu"></p-columnFilter></div>
          </th>
          <th pSortableColumn="customerPhone">
            <div class="flex align-items-center gap-1">Phone <p-sortIcon field="customerPhone"></p-sortIcon> <p-columnFilter type="text" field="customerPhone" display="menu"></p-columnFilter></div>
          </th>
          <th pSortableColumn="totalPayment">
            <div class="flex align-items-center gap-1">Total Payment <p-sortIcon field="totalPayment"></p-sortIcon></div>
          </th>
          <th pSortableColumn="paymentStatus">
            <div class="flex align-items-center gap-1">
                Status <p-sortIcon field="paymentStatus"></p-sortIcon>
                <p-columnFilter field="paymentStatus" matchMode="equals" display="menu">
                    <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                        <p-select [ngModel]="value" [options]="[{label: 'Done', value: 'Done'}, {label: 'Pending', value: 'Pending'}]" 
                                 (onChange)="filter($event.value)" placeholder="Status" [showClear]="true" appendTo="body"
                                 optionLabel="label" optionValue="value">
                        </p-select>
                    </ng-template>
                </p-columnFilter>
            </div>
          </th>
          <th pSortableColumn="remainingAmount">
            <div class="flex align-items-center gap-1">Remaining <p-sortIcon field="remainingAmount"></p-sortIcon> <p-columnFilter type="numeric" field="remainingAmount" display="menu"></p-columnFilter></div>
          </th>
          <th pSortableColumn="createdBy">
            <div class="flex align-items-center gap-1">Created By <p-sortIcon field="createdBy"></p-sortIcon> <p-columnFilter type="text" field="createdBy" display="menu"></p-columnFilter></div>
          </th>
          <th class="w-8rem text-center">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-booking>
        <tr>

          <td class="font-bold">{{ booking.customerName }}</td>
          <td>{{ booking.customerPhone }}</td>
          <td class="font-bold" style="color: #055a87;">{{ booking.totalPayment | currency:'PKR ':'symbol':'1.0-0' }}</td>
          <td>
            <span [style.color]="booking.paymentStatus === 'Done' ? '#055a87' : '#ef4444'" class="font-bold">{{ booking.paymentStatus }}</span>
          </td>
          <td class="font-bold" style="color: #055a87;">{{ booking.remainingAmount > 0 ? (booking.remainingAmount | currency:'PKR ':'symbol':'1.0-0') : '' }}</td>
          <td>{{ booking.createdBy }}</td>
          <td class="text-center p-0">
            <div class="flex justify-content-center gap-2">
              <p-button icon="pi pi-print" [text]="true" [rounded]="true" severity="secondary" size="small" (onClick)="printBooking(booking)" pTooltip="Print Receipt"></p-button>
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" size="small" (onClick)="editBooking(booking)" pTooltip="Edit Booking"></p-button>
              <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" size="small" (onClick)="deleteBooking(booking.id)" pTooltip="Delete Booking"></p-button>
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="7" class="text-center text-500 p-4">No bookings found.</td>
        </tr>
      </ng-template>
    </p-table>
  </p-dialog>

  <!-- Extras Dialog -->
  <p-dialog header="Select Extras" [modal]="true" [(visible)]="showExtrasDialog" [style]="{ width: '500px' }" [dismissableMask]="true">
    <p-table [value]="availableExtras()" responsiveLayout="scroll" [rows]="5" [paginator]="availableExtras().length > 5">
      <ng-template pTemplate="header">
        <tr>
          <th>Item Name</th>
          <th>Price</th>
          <th class="w-8rem">Quantity</th>
          <th class="w-4rem"></th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-extra>
        <tr>
          <td>
            <div class="font-bold">{{ extra.name }}</div>
          </td>
          <td class="font-bold" style="color: #055a87;">{{ extra.price | currency:'PKR ':'symbol':'1.0-0' }}</td>
          <td>
             <p-inputNumber [(ngModel)]="extra.tempQty" [min]="0" [showButtons]="true" buttonLayout="horizontal" 
                          spinnerMode="horizontal" inputStyleClass="text-center w-3rem" class="w-full"
                          decrementButtonClass="p-button-secondary" incrementButtonClass="p-button-secondary"
                          incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                          (onInput)="onExtraQtyChange(extra, $event.value)"></p-inputNumber>
          </td>
          <td></td>
        </tr>
      </ng-template>
    </p-table>
  </p-dialog>

  <!-- Category Bookings Dialog -->
  <p-dialog [header]="'Bookings: ' + (selectedCategoryForBookings()?.name || '')" [modal]="true" [(visible)]="showCategoryBookingsDialog" [style]="{ width: '70vw' }" [maximizable]="true" [dismissableMask]="true">
    <p-table [value]="categoryBookingsList()" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped" 
             [paginator]="true" [rows]="10" [globalFilterFields]="['customerName', 'customerPhone', 'status']">
      <ng-template pTemplate="header">
        <tr>
          <th>Customer</th>
          <th>Phone</th>
          <th>Room</th>
          <th>Timing</th>
          <th>Status</th>
          <th>Payment</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-cb>
        <tr>
          <td class="font-bold">{{ cb.customerName }}</td>
          <td>{{ cb.customerPhone }}</td>
          <td class="font-bold text-primary">{{ cb.gameRoomName }}</td>
          <td class="text-sm">
             <div>{{ cb.startTime | date:'shortTime' }} - {{ cb.endTime | date:'shortTime' }}</div>
             <div class="text-500 text-xs">{{ cb.startTime | date:'mediumDate' }}</div>
          </td>
          <td>
            <span class="font-bold" [style.color]="cb.status === 'Current' ? '#22c55e' : '#eab308'">{{ cb.status }}</span>
          </td>
          <td>
            <span [style.color]="cb.paymentStatus === 'Done' ? '#055a87' : '#ef4444'" class="font-bold">{{ cb.paymentStatus }}</span>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center text-500 p-4">No current or upcoming bookings for this game.</td>
        </tr>
      </ng-template>
    </p-table>
  </p-dialog>

  <!-- Room Bookings Dialog -->
  <p-dialog [header]="'Bookings: Room ' + (selectedRoomForBookings()?.roomNo || '')" [modal]="true" [(visible)]="showRoomBookingsDialog" [style]="{ width: '70vw' }" [maximizable]="true" [dismissableMask]="true">
    <p-table [value]="roomBookingsList()" responsiveLayout="scroll" styleClass="p-datatable-sm p-datatable-striped" 
             [paginator]="true" [rows]="10" [globalFilterFields]="['customerName', 'customerPhone', 'status']">
      <ng-template pTemplate="header">
        <tr>
          <th>Customer</th>
          <th>Phone</th>
          <th>Game</th>
          <th>Timing</th>
          <th>Status</th>
          <th>Payment</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-cb>
        <tr>
          <td class="font-bold">{{ cb.customerName }}</td>
          <td>{{ cb.customerPhone }}</td>
          <td class="font-bold text-primary">{{ cb.gameCategoryName }}</td>
          <td class="text-sm">
             <div>{{ cb.startTime | date:'shortTime' }} - {{ cb.endTime | date:'shortTime' }}</div>
             <div class="text-500 text-xs">{{ cb.startTime | date:'mediumDate' }}</div>
          </td>
          <td>
            <span class="font-bold" [style.color]="cb.status === 'Current' ? '#22c55e' : '#eab308'">{{ cb.status }}</span>
          </td>
          <td>
            <span [style.color]="cb.paymentStatus === 'Done' ? '#055a87' : '#ef4444'" class="font-bold">{{ cb.paymentStatus }}</span>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center text-500 p-4">No current or upcoming bookings for this room.</td>
        </tr>
      </ng-template>
    </p-table>
  </p-dialog>

  <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
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
  cartExtras = signal<ExtraCartItem[]>([]);
  editingCartItemId = signal<string | null>(null);

  // Customer Profile
  customerName = '';
  customerPhone = '';
  cashReceived = signal(0);
  editingBookingId = signal<string | null>(null);

  cashRemaining = computed(() => Math.max(0, this.grandTotal() - this.cashReceived()));

  onCashReceivedChange() {
    // no-op: signal binding handles reactivity
  }

  // Prevents UTC shift by formatting the exact local time selected
  private toLocalISOString(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return date.getFullYear() + '-'
      + pad(date.getMonth() + 1) + '-'
      + pad(date.getDate()) + 'T'
      + pad(date.getHours()) + ':'
      + pad(date.getMinutes()) + ':'
      + pad(date.getSeconds());
  }

  // Bookings History
  showBookingsDialog = false;
  bookingsList = signal<any[]>([]);
  
  // Category Bookings
  showCategoryBookingsDialog = false;
  selectedCategoryForBookings = signal<GameCategory | null>(null);
  categoryBookingsList = signal<any[]>([]);

  // Room Bookings
  showRoomBookingsDialog = false;
  selectedRoomForBookings = signal<GameRoom | null>(null);
  roomBookingsList = signal<any[]>([]);

  selectedCategory = signal<GameCategory | null>(null);
  selectedRoom = signal<GameRoom | null>(null);

  calculatedPrice = signal<number | null>(null);

  availableExtras = signal<any[]>([]);
  showExtrasDialog = false;

  // Derived State (Computed)
  filteredRooms = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return [];
    return this.rooms().filter(r => r.gameCategoryId === cat.id);
  });

  grandTotal = computed(() => {
    const itemsTotal = this.cartItems().reduce((acc, item) => acc + Math.max(0, item.calculatedPrice - (item.discountAmount || 0)), 0);
    const extrasTotal = this.cartExtras().reduce((acc, item) => acc + item.totalPrice, 0);
    return itemsTotal + extrasTotal;
  });

  showDialog = false;
  sessionForm!: FormGroup;

  private fb = inject(FormBuilder);
  private catSvc = inject(GameCategoryService);
  private roomSvc = inject(GameRoomService);
  private extraSvc = inject(ExtraService);
  private sessionSvc = inject(SessionService);
  private messageSvc = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

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

    this.extraSvc.getExtras().pipe(takeUntil(this.destroy$)).subscribe(extras => {
      this.availableExtras.set(extras.map(e => ({ ...e, tempQty: 0 })));
    });
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

  updateDiscount(id: string, discount: number | null) {
    this.cartItems.update(items =>
      items.map(i => i.id === id ? { ...i, discountAmount: discount || 0 } : i)
    );
  }

  removeCartItem(id: string) {
    this.cartItems.update(items => items.filter(i => i.id !== id));
  }

  clearCart() {
    this.cartItems.set([]);
    this.cartExtras.set([]);
    this.customerName = '';
    this.customerPhone = '';
    this.cashReceived.set(0);
    this.editingBookingId.set(null);

    // Sync dialog quantities back to 0
    this.availableExtras.update(extras => extras.map(e => ({ ...e, tempQty: 0 })));
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
      startTime: this.toLocalISOString(val.startTime as Date),
      endTime: this.toLocalISOString(val.endTime as Date),
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
    const startObj = new Date(val.startTime as Date);
    const endObj = new Date(val.endTime as Date);

    // Front-line guard: Prevent adding duplicates of overlapping slots to the exact local cart
    const localOverlap = this.cartItems().find(item => 
       item.room.id === room.id && 
       item.id !== this.editingCartItemId() && 
       new Date(item.startTime) < endObj && 
       new Date(item.endTime) > startObj
    );

    if (localOverlap) {
       this.messageSvc.add({ severity: 'error', summary: 'Cart Conflict', detail: 'This room slot overlaps with an existing pending ticket in your cart.' });
       return;
    }

    // Backend guard: Execute exact overlap protection API check
    const payload = {
      gameRoomId: room.id,
      startTime: this.toLocalISOString(startObj),
      endTime: this.toLocalISOString(endObj),
      excludeBookingMasterId: this.editingBookingId()
    };

    this.sessionSvc.checkOverlap(payload).subscribe({
      next: () => {
        const newItem: CartItem = {
          id: this.editingCartItemId() ? this.editingCartItemId()! : Math.random().toString(36).substring(2, 9),
          category: cat,
          room: room,
          startTime: startObj,
          endTime: endObj,
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
      },
      error: (err) => {
        const detail = err.error?.message || 'Room is already booked for the selected time slot.';
        this.messageSvc.add({ severity: 'error', summary: 'Schedule Conflict', detail });
      }
    });
  }

  checkoutCart(printAfter: boolean = false) {
    if (this.cartItems().length === 0 || !this.customerName.trim()) {
      this.messageSvc.add({ severity: 'warn', summary: 'Missing Info', detail: 'Please provide Customer Name and add slots to cart.' });
      return;
    }

    const bookingId = this.editingBookingId();
    const paymentStatus = this.cashRemaining() <= 0 ? 'Done' : 'Pending';

    const payload = {
      id: bookingId || '',
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      paymentStatus,
      paidAmount: this.cashReceived(),
      items: this.cartItems().map(item => ({
        gameRoomId: item.room.id,
        gameCategoryId: item.category.id,
        startTime: this.toLocalISOString(item.startTime),
        endTime: this.toLocalISOString(item.endTime),
        numberOfPersons: item.numberOfPersons,
        discountAmount: item.discountAmount || 0
      })),
      extras: this.cartExtras().map(ex => ({
        extraId: ex.extra.id,
        quantity: ex.quantity
      }))
    };

    const pseudoBooking = {
      id: bookingId || 'PENDING',
      createdAt: new Date(),
      paymentStatus,
      paidAmount: this.cashReceived(),
      totalPayment: this.grandTotal(),
      items: this.cartItems().map(ci => ({
         gameRoomName: ci.room.roomNo,
         gameCategoryName: ci.category.name,
         startTime: ci.startTime,
         endTime: ci.endTime,
         totalPersons: ci.numberOfPersons,
         discountAmount: ci.discountAmount || 0,
         totalAmount: Math.max(0, ci.calculatedPrice - (ci.discountAmount || 0))
      })),
      extras: this.cartExtras().map(ex => ({
         extraName: ex.extra.name,
         quantity: ex.quantity,
         totalAmount: ex.totalPrice
      }))
    };

    if (bookingId) {
      this.sessionSvc.updateBooking(bookingId, payload).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Updated', detail: 'Ticket completely updated!' });
          if (printAfter) this.printBooking(pseudoBooking);
          this.clearCart();
        },
        error: (err) => {
          this.messageSvc.add({ severity: 'error', summary: 'Update Failed', detail: err.error?.message || 'Failed to update ticket.' });
        }
      });
    } else {
      this.sessionSvc.checkoutBooking(payload).subscribe({
        next: (res: any) => {
          this.messageSvc.add({ severity: 'success', summary: 'Booking Finalized', detail: 'Ticket completely saved!' });
          if (printAfter) {
            pseudoBooking.id = res?.value || res?.id || 'VCH/GUEST'; // Backend wraps primitive Guid inside mapped `Value` via Result<>
            this.printBooking(pseudoBooking);
          }
          this.clearCart();
        },
        error: (err) => {
          this.messageSvc.add({ severity: 'error', summary: 'Checkout Failed', detail: err.error?.message || 'Failed to submit booking.' });
        }
      });
    }
  }

  openCategoryBookings(category: GameCategory, event: Event) {
    event.stopPropagation();
    this.selectedCategoryForBookings.set(category);
    
    this.sessionSvc.getBookings().subscribe({
      next: (res) => {
        const flattened: any[] = [];
        const now = new Date();
        
        res.forEach((master: any) => {
          (master.items || []).forEach((item: any) => {
            if (item.gameCategoryId === category.id) {
               const start = new Date(item.startTime);
               const end = new Date(item.endTime);
               
               // Show only current and upcoming bookings based on endTime
               if (end > now) {
                 flattened.push({
                   bookingId: master.id,
                   customerName: master.customerName,
                   customerPhone: master.customerPhone,
                   paymentStatus: master.paymentStatus,
                   gameRoomName: item.gameRoomName,
                   startTime: start,
                   endTime: end,
                   status: start <= now && end >= now ? 'Current' : 'Upcoming'
                 });
               }
            }
          });
        });
        
        flattened.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        this.categoryBookingsList.set(flattened);
        this.showCategoryBookingsDialog = true;
      },
      error: () => this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Could not fetch bookings.' })
    });
  }

  openRoomBookings(room: GameRoom, event: Event) {
    event.stopPropagation();
    this.selectedRoomForBookings.set(room);
    
    this.sessionSvc.getBookings().subscribe({
      next: (res) => {
        const flattened: any[] = [];
        const now = new Date();
        
        res.forEach((master: any) => {
          (master.items || []).forEach((item: any) => {
            if (item.gameRoomId === room.id) {
               const start = new Date(item.startTime);
               const end = new Date(item.endTime);
               
               if (end > now) {
                 flattened.push({
                   bookingId: master.id,
                   customerName: master.customerName,
                   customerPhone: master.customerPhone,
                   paymentStatus: master.paymentStatus,
                   gameCategoryName: item.gameCategoryName,
                   startTime: start,
                   endTime: end,
                   status: start <= now && end >= now ? 'Current' : 'Upcoming'
                 });
               }
            }
          });
        });
        
        flattened.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        this.roomBookingsList.set(flattened);
        this.showRoomBookingsDialog = true;
      },
      error: () => this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Could not fetch bookings.' })
    });
  }

  printBooking(booking: any) {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Popup blocked. Please allow popups to print receipts.' });
      return;
    }

    let itemsHtml = '';
    let totalQty = 0;
    let totalItems = 0;
    
    // Process Rooms
    (booking.items ?? []).forEach((item: any) => {
      const netAmount = item.totalAmount || 0;
      const discount = item.discountAmount || 0;
      const originalPrice = netAmount + discount;
      const persons = item.totalPersons || 1;

      const sDate = new Date(item.startTime);
      const eDate = new Date(item.endTime);
      const sTime = sDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      const eTime = eDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

      totalQty += persons;
      totalItems += 1;
      itemsHtml += '<tr><td colspan="5" class="product-name">' + item.gameRoomName + ' (' + item.gameCategoryName + ') ' + sTime + '-' + eTime + '</td></tr>';
      itemsHtml += '<tr class="product-data">';
      itemsHtml += '<td></td><td class="text-center">' + persons + '</td><td class="text-right">' + (originalPrice).toLocaleString('en-US') + '</td><td class="text-center">' + discount.toLocaleString('en-US') + '</td><td class="text-right">' + (netAmount).toLocaleString('en-US') + '</td>';
      itemsHtml += '</tr>';
    });

    // Process Extras
    (booking.extras ?? []).forEach((ex: any) => {
      const qty = ex.quantity || 1;
      const amount = ex.totalAmount || 0;
      const price = amount / qty;
      totalQty += qty;
      totalItems += 1;
      itemsHtml += '<tr><td colspan="5" class="product-name">' + ex.extraName + '</td></tr>';
      itemsHtml += '<tr class="product-data">';
      itemsHtml += '<td></td><td class="text-center">' + qty + '</td><td class="text-right">' + price.toLocaleString('en-US') + '</td><td class="text-center">0</td><td class="text-right">' + amount.toLocaleString('en-US') + '</td>';
      itemsHtml += '</tr>';
    });

    const totalAmountStr = (booking.totalPayment || 0).toLocaleString('en-US');
    const totalPaidStr = (booking.paidAmount || 0).toLocaleString('en-US');

    let orderNum = "VCH/" + booking.id.toString().substring(0, 6).toUpperCase();

    const dateObj = new Date(booking.createdAt || new Date());
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
    const formattedDate = day + '/' + month + '/' + year + ' ' + timeStr;

    const statusText = booking.paymentStatus === "Done" ? "Paid" : "Pending";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${orderNum}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            margin: 0;
            padding: 10px;
            width: 80mm;
            color: #000;
          }
          * { box-sizing: border-box; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .logo { text-align: center; margin-bottom: 5px; }
          .logo h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -1px; }
          .logo h1 span.yr { font-size: 30px; letter-spacing: -3px; }
          .logo h1 span.tech { font-size: 14px; display: block; letter-spacing: 1px; color: #04506c; margin-top: -5px;}
          .store-info { text-align: center; margin-bottom: 15px; font-weight: bold; font-size: 12px; }
          .store-info p { margin: 2px 0; }
          
          .qr-box { text-align: center; margin-bottom: 10px; }
          .qr-box img { width: 80px; height: 80px; }
          
          .invoice-info { margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
          .invoice-info div { margin-bottom: 2px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { padding: 4px; font-size: 13px; }
          th { border: 1.5px solid #000; font-weight: bold; }
          
          .product-name { padding-top: 8px; font-weight: 500;}
          .product-data { border-bottom: 1px solid #ddd; }
          .product-data td { padding-top: 2px; padding-bottom: 8px; }
          
          .totals-row td { border-top: 1px solid #000; border-bottom: 1px solid #000; font-weight: bold; padding: 6px 4px; }
          
          .amount-summary { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border: 1.5px solid #000; padding: 4px; margin-bottom: 10px; }
          .cash-received { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; padding: 4px; margin-bottom: 15px; text-transform: uppercase; }

          .footer { text-align: center; font-size: 12px; margin-top: 20px;}
        </style>
      </head>
      <body>
        <div class="logo">
          <h1><span class="yr">YR</span> YOUROS <span class="tech">TECHNOLOGIES</span></h1>
        </div>
        <div class="store-info">
          <p>Youros Technologies</p>
          <p>Rufi Heaven Appartment Gulshan-e-iqbaal Block</p>
          <p>13D</p>
          <p>0300-9270194, 0325-1113099</p>
        </div>
        
        <div class="qr-box">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/923009270194" alt="QR" />
        </div>

        <div class="invoice-info text-left">
          <div class="font-bold font-lg" style="font-size:16px;">ORDER #: ${orderNum}</div>
          <div><span class="font-bold">DATE &amp; TIME :</span>${formattedDate}</div>
          <div><span class="font-bold">BILL STATUS:</span>${statusText}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Products</th>
              <th width="15%" class="text-center">Qty</th>
              <th width="20%" class="text-center">Price</th>
              <th width="15%" class="text-center">Disc</th>
              <th width="20%" class="text-center">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="totals-row">
              <td class="text-center">${totalItems}</td>
              <td class="text-center">${totalQty}</td>
              <td class="text-right">${totalAmountStr}</td>
              <td class="text-center">0</td>
              <td class="text-right">${totalAmountStr}</td>
            </tr>
          </tbody>
        </table>

        <div class="amount-summary">
          <span>Amount:</span>
          <span>${totalAmountStr}</span>
        </div>

        <div class="footer">
          Powered By : Youros Technologies
        </div>

        <script>
          /* Delay slightly to ensure QR code image is loaded before printing */
          window.onload = function() { 
              setTimeout(function() { window.print(); window.close(); }, 500); 
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  openBookingsDialog() {
    this.sessionSvc.getBookings().subscribe({
      next: (data) => {
        const mappedData = data.map((d: any) => ({
             ...d, 
             remainingAmount: Math.max(0, d.totalPayment - d.paidAmount)
        }));
        this.bookingsList.set(mappedData);
        this.showBookingsDialog = true;
      },
      error: () => this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bookings.' })
    });
  }

  openExtrasDialog() {
    this.showExtrasDialog = true;
  }

  onExtraQtyChange(extra: any, qty: number | null) {
    const finalQty = qty || 0;
    extra.tempQty = finalQty; // ensure binding sync

    this.cartExtras.update(items => {
      const existing = items.find(i => i.extra.id === extra.id);

      if (finalQty <= 0) {
        return items.filter(i => i.extra.id !== extra.id);
      }

      if (existing) {
        return items.map(i => i.extra.id === extra.id
          ? { ...i, quantity: finalQty, totalPrice: extra.price * finalQty }
          : i
        );
      } else {
        return [...items, {
          id: Math.random().toString(36).substring(2, 9),
          extra: extra,
          quantity: finalQty,
          totalPrice: extra.price * finalQty
        }];
      }
    });
  }

  removeExtraItem(id: string) {
    this.cartExtras.update(items => {
      const removed = items.find(i => i.id === id);
      if (removed) {
        // Sync back to availableExtras dialog
        this.availableExtras.update(extras => extras.map(e =>
          e.id === removed.extra.id ? { ...e, tempQty: 0 } : e
        ));
      }
      return items.filter(i => i.id !== id);
    });
  }

  deleteBooking(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this booking?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-text',
      accept: () => {
        this.sessionSvc.deleteBooking(id).subscribe({
          next: () => {
            this.messageSvc.add({ severity: 'success', summary: 'Deleted', detail: 'Booking has been deleted successfully.' });
            this.bookingsList.update(list => list.filter(b => b.id !== id));
          },
          error: () => this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete booking.' })
        });
      }
    });
  }

  editBooking(booking: any) {
    this.clearCart();

    this.editingBookingId.set(booking.id);
    this.customerName = booking.customerName;
    this.customerPhone = booking.customerPhone;
    this.cashReceived.set(booking.paidAmount ?? 0);

    const mappedCartItems: CartItem[] = (booking.items || []).map((item: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      category: { id: item.gameCategoryId, name: item.gameCategoryName } as GameCategory,
      room: { id: item.gameRoomId, roomNo: item.gameRoomName, maxPlayers: item.totalPersons, ratePerHour: item.tableRate } as unknown as GameRoom,
      startTime: new Date(item.startTime),
      endTime: new Date(item.endTime),
      numberOfPersons: item.totalPersons,
      calculatedPrice: item.totalAmount
    }));

    this.cartItems.set(mappedCartItems);

    const mappedExtras: ExtraCartItem[] = (booking.extras || []).map((ex: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      extra: { id: ex.extraId, name: ex.extraName, price: ex.unitPrice } as Extra,
      quantity: ex.quantity,
      totalPrice: ex.totalAmount
    }));
    this.cartExtras.set(mappedExtras);

    // Sync dialog quantities for edit mode
    this.availableExtras.update(extras => extras.map(e => {
      const cartEx = mappedExtras.find(me => me.extra.id === e.id);
      return { ...e, tempQty: cartEx ? cartEx.quantity : 0 };
    }));

    this.showBookingsDialog = false;
    this.messageSvc.add({ severity: 'info', summary: 'Edit Mode Enabled', detail: `Editing ticket for ${booking.customerName}` });
  }
}
