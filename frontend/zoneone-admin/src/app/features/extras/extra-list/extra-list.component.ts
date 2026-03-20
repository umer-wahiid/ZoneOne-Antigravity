import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExtraService } from '../../../core/services/extra.service';
import { Extra } from '../../../core/models/extra.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-extra-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
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
          <h1 class="text-4xl font-bold mb-1">Extras & Inventory</h1>
          <p class="text-600">Cold drinks, snacks, and other items</p>
        </div>
        <p-button label="Add Extra Item" icon="pi pi-plus" (onClick)="showDialog()"></p-button>
      </div>

      <p-table #dt [value]="(extras$ | async) || []" [tableStyle]="{ 'min-width': '50rem' }" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="false" [stripedRows]="true"
               [globalFilterFields]="['name']"
               styleClass="p-datatable-sm">
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
                <p-columnFilter type="text" field="name" display="menu"></p-columnFilter>
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
            <td class="font-bold" style="color: #055a87;">{{ extra.price | currency:'PKR ':'symbol':'1.0-0' }}</td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (onClick)="editExtra(extra)" [style]="{'margin-right': '0.5rem'}"></p-button>
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

      <!-- Extra Form Dialog -->
      <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Edit Extra Item' : 'Add Extra Item'" 
                [modal]="true" [style]="{width: '450px'}" styleClass="p-fluid shadow-6"
                [draggable]="false" [resizable]="false" [dismissableMask]="true">
        <form [formGroup]="extraForm" (ngSubmit)="saveExtra()" class="flex flex-column gap-3 mt-3">
          <div class="field">
            <label for="name" class="font-bold block mb-2 text-secondary">Item Name</label>
            <input pInputText id="name" formControlName="name" placeholder="e.g. Cold Drink 500ml" class="w-full" />
            <small *ngIf="f['name'].invalid && f['name'].touched" class="text-red-400">
              Name is required.
            </small>
          </div>

          <div class="field">
            <label for="price" class="font-bold block mb-2 text-secondary">Unit Price (PKR)</label>
            <p-inputNumber id="price" formControlName="price" placeholder="0.00" [showButtons]="true" [min]="0"
                          styleClass="w-full" inputStyleClass="w-full font-bold"></p-inputNumber>
             <small *ngIf="f['price'].invalid && f['price'].touched" class="text-red-400">
              Valid price is required.
            </small>
          </div>

          <div class="flex justify-content-end gap-2 mt-4">
            <p-button label="Cancel" icon="pi pi-times" (onClick)="displayDialog = false" 
                     styleClass="p-button-text p-button-secondary"></p-button>
            <p-button label="Save" icon="pi pi-check" type="submit" [loading]="submitting()"
                     [disabled]="extraForm.invalid" styleClass="p-button-theme"></p-button>
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
export class ExtraListComponent implements OnInit {
  private extraSvc = inject(ExtraService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  extras$: Observable<Extra[]> = this.extraSvc.extras$;
  
  displayDialog = false;
  isEditMode = false;
  selectedExtraId: string | null = null;
  submitting = signal(false);

  extraForm = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]]
  });

  get f() { return this.extraForm.controls; }

  ngOnInit() {
    // Initial data load if needed
  }

  showDialog() {
    this.isEditMode = false;
    this.selectedExtraId = null;
    this.extraForm.reset({ price: 0 });
    this.displayDialog = true;
  }

  editExtra(extra: Extra) {
    this.isEditMode = true;
    this.selectedExtraId = extra.id;
    this.extraForm.patchValue({
      name: extra.name,
      price: extra.price
    });
    this.displayDialog = true;
  }

  saveExtra() {
    if (this.extraForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.extraForm.value;

    if (this.isEditMode && this.selectedExtraId) {
      this.extraSvc.updateExtra(this.selectedExtraId, formValue as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item updated successfully!' });
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update item.' });
          this.submitting.set(false);
        }
      });
    } else {
      this.extraSvc.addExtra(formValue as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item created successfully!' });
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create item.' });
          this.submitting.set(false);
        }
      });
    }
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
