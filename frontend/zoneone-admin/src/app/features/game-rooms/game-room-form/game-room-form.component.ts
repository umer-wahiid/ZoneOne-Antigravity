import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameRoomService } from '../../../core/services/game-room.service';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { GameCategory } from '../../../core/models/game-category.model';
import { take } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-game-room-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule
  ],
  template: `
    <div class="form-wrapper">
      <p-button icon="pi pi-arrow-left" label="Back to Rooms" [text]="true" (onClick)="goBack()" [style]="{'margin-bottom': '2rem'}"></p-button>

      <div class="form-container">
        <div class="form-header">
          <h2 class="title">{{ isEditMode ? 'Edit' : 'Add New' }} Room / Table</h2>
          <p class="subtitle">{{ isEditMode ? 'Update room details' : 'Configure a new room or table' }}</p>
        </div>

        <form [formGroup]="roomForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <div class="form-row flex gap-5 mb-4">
            <div class="form-group flex flex-column gap-2 flex-1">
              <label for="roomNo" class="font-semibold text-secondary">Table / Room No.</label>
              <input pInputText id="roomNo" formControlName="roomNo" placeholder="e.g. TT-01" class="w-full">
              <small *ngIf="f['roomNo'].invalid && (f['roomNo'].dirty || f['roomNo'].touched)" class="text-red-400">
                Room No. is required.
              </small>
            </div>

            <div class="form-group flex flex-column gap-2 flex-1">
              <label for="gameCategoryId" class="font-semibold text-secondary">Gaming Category</label>
              <p-select id="gameCategoryId" formControlName="gameCategoryId"
                       [options]="categories" optionLabel="name" optionValue="id"
                       placeholder="Select a category" styleClass="w-full"></p-select>
              <small *ngIf="f['gameCategoryId'].invalid && (f['gameCategoryId'].dirty || f['gameCategoryId'].touched)" class="text-red-400">
                Category is required.
              </small>
            </div>
          </div>

          <div class="form-group flex flex-column gap-2 mb-4">
            <label for="maxPlayers" class="font-semibold text-secondary">No. of People Allowed</label>
            <p-inputNumber id="maxPlayers" formControlName="maxPlayers" [min]="1" [showButtons]="true" styleClass="w-full"></p-inputNumber>
          </div>

          <div class="form-row flex gap-5 mb-4">
            <div class="form-group flex flex-column gap-2 flex-1">
              <label for="ratePerHour" class="font-semibold text-secondary">Rate per Hour</label>
              <p-inputNumber id="ratePerHour" formControlName="ratePerHour" mode="currency" currency="PKR" locale="en-PK" styleClass="w-full"></p-inputNumber>
            </div>

            <div class="form-group flex flex-column gap-2 flex-1">
              <label for="ratePerExtraPerson" class="font-semibold text-secondary">Rate per Extra Person</label>
              <p-inputNumber id="ratePerExtraPerson" formControlName="ratePerExtraPerson" mode="currency" currency="PKR" locale="en-PK" styleClass="w-full"></p-inputNumber>
            </div>
          </div>

          <div class="form-actions flex justify-content-end gap-3 mt-4 pt-4 border-top-1 border-gray-200">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="goBack()"></p-button>
            <p-button type="submit" [label]="isEditMode ? 'Save Changes' : 'Add Room'" [disabled]="roomForm.invalid"></p-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper { max-width: 800px; margin: 0 auto; animation: slideIn 0.3s ease; }
    .form-container {
      background-color: var(--bg-card); border-radius: var(--border-radius-lg);
      padding: 3rem; border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
    }
    .form-header {
      margin-bottom: 2.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 1.5rem;
      .title { font-size: 2rem; color: var(--text-primary); margin-bottom: 0.5rem; }
      .subtitle { color: var(--text-muted); }
    }
    .text-secondary { color: var(--text-secondary); }
    .text-red-400 { color: #fc8181; }
    .flex { display: flex; } .flex-column { flex-direction: column; }
    .gap-2 { gap: 0.5rem; } .gap-3 { gap: 1rem; } .gap-4 { gap: 1.5rem; } .gap-5 { gap: 2rem; }
    .mb-4 { margin-bottom: 1.5rem; } .mt-4 { margin-top: 1.5rem; } .pt-4 { padding-top: 1.5rem; }
    .flex-1 { flex: 1; } .w-full { width: 100%; }
    .justify-content-end { justify-content: flex-end; }
    .font-semibold { font-weight: 600; }
    .border-top-1 { border-top: 1px solid; }
    .border-gray-200 { border-color: rgba(0,0,0,0.1); }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class GameRoomFormComponent implements OnInit {
  roomForm: FormGroup;
  isEditMode = false;
  roomId: string | null = null;
  categories: GameCategory[] = [];

  private fb = inject(FormBuilder);
  private roomSvc = inject(GameRoomService);
  private categorySvc = inject(GameCategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  constructor() {
    this.roomForm = this.fb.group({
      roomNo: ['', Validators.required],
      gameCategoryId: ['', Validators.required],
      maxPlayers: [2, Validators.required],
      ratePerHour: [0, Validators.required],
      ratePerExtraPerson: [0]
    });
  }

  get f() { return this.roomForm.controls; }

  ngOnInit(): void {
    // Load categories for dropdown directly from API
    this.categorySvc.getCategoriesFromApi().subscribe(cats => {
      this.categories = cats;
    });

    this.roomId = this.route.snapshot.paramMap.get('id');
    if (this.roomId) {
      this.isEditMode = true;
      this.roomSvc.getRoomById(this.roomId).pipe(take(1)).subscribe({
        next: (room) => {
          if (room) {
            this.roomForm.patchValue({
              roomNo: room.roomNo,
              gameCategoryId: room.gameCategoryId,
              maxPlayers: room.maxPlayers,
              ratePerHour: room.ratePerHour,
              ratePerExtraPerson: room.ratePerExtraPerson
            });
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load room.' });
          this.goBack();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.roomForm.invalid) return;
    const formValue = this.roomForm.value;

    if (this.isEditMode && this.roomId) {
      this.roomSvc.updateRoom(this.roomId, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room updated!' });
          this.goBack();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update room.' })
      });
    } else {
      this.roomSvc.addRoom(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room created!' });
          this.goBack();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create room.' })
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }
}
