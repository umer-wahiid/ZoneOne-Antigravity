import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExtraService } from '../../../core/services/extra.service';
import { take } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-extra-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule
  ],
  template: `
    <div class="form-wrapper p-4">
      <p-button icon="pi pi-arrow-left" label="Back to Inventory" [text]="true" (onClick)="goBack()" class="mb-4"></p-button>
      
      <div class="surface-card p-5 border-round shadow-2" style="max-width: 600px; margin: 0 auto;">
        <div class="mb-5 pb-3 border-bottom-1 border-300">
          <h2 class="text-3xl font-bold mb-1">{{ isEditMode ? 'Edit' : 'Add' }} Extra Item</h2>
          <p class="text-600">{{ isEditMode ? 'Update item price and details' : 'Add new snacks or drinks to your POS system' }}</p>
        </div>

        <form [formGroup]="extraForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <div class="flex flex-column gap-2">
            <label for="name" class="font-semibold text-700">Item Name</label>
            <input pInputText id="name" formControlName="name" placeholder="e.g. Cold Drink 500ml" 
                   [ngClass]="{'ng-invalid ng-dirty': f['name'].invalid && (f['name'].dirty || f['name'].touched)}" class="w-full">
            <small *ngIf="f['name'].invalid && (f['name'].dirty || f['name'].touched)" class="text-red-500">
              Name is required.
            </small>
          </div>

          <div class="flex flex-column gap-2">
            <label for="price" class="font-semibold text-700">Unit Price (PKR)</label>
            <p-inputNumber id="price" formControlName="price" placeholder="0.00" [showButtons]="true" [min]="0"
                          styleClass="w-full" inputStyleClass="w-full font-bold"
                          [ngClass]="{'ng-invalid ng-dirty': f['price'].invalid && (f['price'].dirty || f['price'].touched)}"></p-inputNumber>
             <small *ngIf="f['price'].invalid && (f['price'].dirty || f['price'].touched)" class="text-red-500">
              Price is required.
            </small>
          </div>

          <div class="flex justify-content-end gap-3 mt-4 pt-4 border-top-1 border-300">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="goBack()"></p-button>
            <p-button type="submit" [label]="isEditMode ? 'Save Changes' : 'Create Item'" [disabled]="extraForm.invalid" [icon]="isEditMode ? 'pi pi-save' : 'pi pi-plus'"></p-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ExtraFormComponent implements OnInit {
  extraForm: FormGroup;
  isEditMode = false;
  extraId: string | null = null;

  private fb = inject(FormBuilder);
  private extraSvc = inject(ExtraService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  constructor() {
    this.extraForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.extraForm.controls; }

  ngOnInit(): void {
    this.extraId = this.route.snapshot.paramMap.get('id');

    if (this.extraId) {
      this.isEditMode = true;
      this.extraSvc.getExtras().pipe(take(1)).subscribe(extras => {
          const extra = extras.find(e => e.id === this.extraId);
          if (extra) {
            this.extraForm.patchValue({
              name: extra.name,
              price: extra.price
            });
          } else {
              // Fallback if not in cached subject
              // We could implement getExtraById in service if needed
          }
      });
    }
  }

  onSubmit(): void {
    if (this.extraForm.invalid) return;

    const formValue = this.extraForm.value;

    if (this.isEditMode && this.extraId) {
      this.extraSvc.updateExtra(this.extraId, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item updated successfully!' });
          this.goBack();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update item.' })
      });
    } else {
      this.extraSvc.addExtra(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item created successfully!' });
          this.goBack();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create item.' })
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/extras']);
  }
}
