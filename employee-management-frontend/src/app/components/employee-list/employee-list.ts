import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmployeeService, Employee } from '../../services/employee';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {
  employees: Employee[] = [];
  loading = false;
  error: string | null = null;
  private subscription: Subscription | null = null;
  totalEmployees = 0;
  activeEmployees = 0;
  inactiveEmployees = 0;
  sortField = 'employeeId';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedColumns: Set<string> = new Set(['sno', 'id', 'name', 'email', 'contact', 'gender', 'role', 'status', 'actions']);
  showSettings = false;
  availableColumns = [
    { key: 'sno', label: 'S.No' },
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'contact', label: 'Contact' },
    { key: 'gender', label: 'Gender' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;
    this.employees = [];
    console.log('Loading employees from:', 'http://localhost:5000/api/employees');

    this.subscription = this.employeeService.getEmployees().subscribe({
      next: (data) => {
        console.log('Employees loaded:', data);
        this.employees = data;
        this.totalEmployees = data.length;
        this.activeEmployees = data.filter((e: any) => e.isActive).length;
        this.inactiveEmployees = data.filter((e: any) => !e.isActive).length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.error = 'Failed to load employees: ' + (err.message || err.statusText);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.employees = [...this.employees].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  toggleColumn(colKey: string, event: any): void {
    if (colKey === 'actions') return;
    if (event.target.checked) {
      this.selectedColumns.add(colKey);
    } else {
      this.selectedColumns.delete(colKey);
    }
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  deleteEmployee(id: number): void {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => this.loadEmployees(),
      error: (err) => {
        this.error = 'Failed to delete employee';
        console.error(err);
      }
    });
  }
}
