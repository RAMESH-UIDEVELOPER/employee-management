import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  username: string = 'User';
  pageTitle: string = 'Dashboard';
  isSidebarCollapsed = true;
  totalEmployees = 0;
  activeEmployees = 0;
  inactiveEmployees = 0;
  currentRoute = '/dashboard';

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {
    this.username = this.authService.getUsername() || 'User';
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      this.currentRoute = event.url;
      this.updatePageTitle(event.url);
    });
  }

  ngOnInit(): void {
    this.loadEmployeeStats();
  }

  loadEmployeeStats(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.totalEmployees = employees.length;
        this.activeEmployees = employees.length;
        this.inactiveEmployees = 0;
      },
      error: (err) => {
        console.error('Error loading employee stats:', err);
      }
    });
  }

  updatePageTitle(url: string): void {
    if (url.includes('/employees')) {
      this.pageTitle = 'Employees';
    } else if (url.includes('/dashboard')) {
      this.pageTitle = 'Dashboard';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  isActive(route: string): boolean {
    if (route === '/dashboard') {
      return this.currentRoute === '/dashboard' || this.currentRoute === '/';
    }
    return this.currentRoute.includes(route);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
