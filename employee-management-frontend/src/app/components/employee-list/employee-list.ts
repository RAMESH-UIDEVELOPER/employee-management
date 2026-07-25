import Swal from 'sweetalert2';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmployeeService, Employee } from '../../services/employee';

interface ColumnDef {
  key: string;
  label: string;
}

interface ColumnHeaderItem {
  colKey: string;
  groupIndex: number;
  colIndex: number;
  col: ColumnDef;
}

interface DisplayRow {
  type: 'group' | 'employee';
  level: number;
  indent: number;
  index: number;
  column?: string;
  value?: string;
  count?: number;
  employee?: Employee;
}

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
  availableColumns: ColumnDef[] = [
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
  columnGroups = [
    { title: 'Basic', columns: ['sno', 'id'], collapsed: false },
    { title: 'Personal', columns: ['name', 'email', 'contact', 'gender'], collapsed: false },
    { title: 'Work', columns: ['role', 'status'], collapsed: false },
    { title: 'Actions', columns: ['actions'], collapsed: false }
  ];
  groupByColumns: string[] = [];
  collapsedGroups: Set<string> = new Set();
  draggedColKey: string | null = null;
  draggedFromGroupIndex: number | null = null;

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
    for (const group of this.columnGroups) {
      const idx = group.columns.indexOf(colKey);
      if (idx !== -1) {
        if (!event.target.checked) {
          group.columns.splice(idx, 1);
        }
        break;
      }
    }
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  toggleGroup(groupIndex: number): void {
    this.columnGroups[groupIndex].collapsed = !this.columnGroups[groupIndex].collapsed;
  }

  isGroupCollapsed(groupIndex: number): boolean {
    return this.columnGroups[groupIndex].collapsed;
  }

  isDataGroupCollapsed(groupValue: string): boolean {
    return this.collapsedGroups.has(groupValue);
  }

  toggleDataGroup(groupValue: string): void {
    if (this.collapsedGroups.has(groupValue)) {
      this.collapsedGroups.delete(groupValue);
    } else {
      this.collapsedGroups.add(groupValue);
    }
  }

  setGroupBy(colKey: string): void {
    if (!this.groupByColumns.includes(colKey)) {
      this.groupByColumns.push(colKey);
    }
    this.collapsedGroups.clear();
  }

  clearGroupBy(): void {
    this.groupByColumns = [];
    this.collapsedGroups.clear();
  }

  removeGroupLevel(level: number): void {
    this.groupByColumns.splice(level, 1);
    this.collapsedGroups.clear();
  }

  toggleGroupCollapse(level: number, groupValue: string): void {
    const key = `${level}|${groupValue}`;
    if (this.collapsedGroups.has(key)) {
      this.collapsedGroups.delete(key);
    } else {
      this.collapsedGroups.add(key);
    }
  }

  isGroupCollapsedByKey(level: number, groupValue: string): boolean {
    return this.collapsedGroups.has(`${level}|${groupValue}`);
  }

  getGroupLabel(colKey: string): string {
    const col = this.availableColumns.find(c => c.key === colKey);
    return col ? col.label : colKey;
  }

  getVisibleColumnHeaders(): ColumnHeaderItem[] {
    const headers: ColumnHeaderItem[] = [];
    this.columnGroups.forEach((group, groupIndex) => {
      if (!this.isGroupCollapsed(groupIndex)) {
        group.columns.forEach((colKey, colIndex) => {
          const col = this.availableColumns.find(c => c.key === colKey);
          if (col) headers.push({ colKey, groupIndex, colIndex, col });
        });
      }
    });
    return headers;
  }

  groupMap(employees: Employee[], colKey: string): Map<string, Employee[]> {
    const map = new Map<string, Employee[]>();
    for (const emp of employees) {
      const val = this.getEmployeeValue(emp, colKey);
      if (!map.has(val)) map.set(val, []);
      map.get(val)!.push(emp);
    }
    return map;
  }

  buildRows(employees: Employee[], columns: string[], level: number, parentKey: string): DisplayRow[] {
    if (columns.length === 0 || level >= columns.length) {
      return employees.map((emp, idx) => ({ type: 'employee', employee: emp, indent: level, level, index: idx + 1 }));
    }

    const col = columns[level];
    const map = this.groupMap(employees, col);
    const rows: DisplayRow[] = [];

    for (const [value, emps] of map) {
      const currentKey = parentKey ? `${parentKey}|${value}` : value;
      const collapsed = this.isGroupCollapsedByKey(level, value);
      rows.push({ type: 'group', level, column: col, value, count: emps.length, indent: level, index: 0 });
      if (!collapsed) {
        rows.push(...this.buildRows(emps, columns, level + 1, currentKey));
      }
    }

    return rows;
  }

  getDisplayRows(): DisplayRow[] {
    if (this.groupByColumns.length === 0) return [];
    return this.buildRows(this.employees, this.groupByColumns, 0, '');
  }

  trackDisplayRow(_index: number, row: DisplayRow): string {
    if (row.type === 'group') {
      return `group-${row.level}-${row.value}-${row.column}`;
    }
    return `emp-${row.employee!._id}`;
  }

  getEmployeeValue(emp: Employee, colKey: string): string {
    switch (colKey) {
      case 'sno': return String((emp as any).employeeId ?? '');
      case 'id': return String((emp as any).employeeId ?? '');
      case 'name': return (emp as any).employeeName ?? '';
      case 'email': return (emp as any).emailId ?? '';
      case 'contact': return (emp as any).contactNo ?? '';
      case 'gender': return (emp as any).gender ?? '';
      case 'role': return (emp as any).role ?? '';
      case 'status': return (emp as any).isActive ? 'Active' : 'Inactive';
      case 'actions': return 'Actions';
      default: return String((emp as any)[colKey] ?? '');
    }
  }

  getColumnLabel(colKey: string): string {
    const col = this.availableColumns.find(c => c.key === colKey);
    return col ? col.label : colKey;
  }

  onColDragStart(colKey: string, groupIndex: number): void {
    this.draggedColKey = colKey;
    this.draggedFromGroupIndex = groupIndex;
  }

  onColDragOver(event: DragEvent, groupIndex: number, colIndex: number): void {
    event.preventDefault();
  }

  onColDrop(event: DragEvent, targetGroupIndex: number, targetColIndex: number): void {
    event.preventDefault();
    if (this.draggedColKey === null || this.draggedFromGroupIndex === null) return;
    if (this.draggedFromGroupIndex === targetGroupIndex && this.columnGroups[targetGroupIndex].columns[targetColIndex] === this.draggedColKey) return;

    const sourceGroup = this.columnGroups[this.draggedFromGroupIndex];
    const targetGroup = this.columnGroups[targetGroupIndex];

    const colIndexInSource = sourceGroup.columns.indexOf(this.draggedColKey);
    if (colIndexInSource === -1) return;

    sourceGroup.columns.splice(colIndexInSource, 1);
    targetGroup.columns.splice(targetColIndex, 0, this.draggedColKey);

    this.draggedColKey = null;
    this.draggedFromGroupIndex = null;
  }

  onTopDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.draggedColKey === null) return;
    this.setGroupBy(this.draggedColKey);
    this.draggedColKey = null;
    this.draggedFromGroupIndex = null;
  }

  onColDragEnd(): void {
    this.draggedColKey = null;
    this.draggedFromGroupIndex = null;
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  deleteEmployee(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            this.loadEmployees();
            Swal.fire('Deleted!', 'Employee record has been deleted.', 'success');
          },
          error: (err) => {
            this.error = 'Failed to delete employee';
            console.error(err);
          }
        });
      }
    });
  }
}
