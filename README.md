# Employee Management System

A full-stack employee management application built with Angular (frontend) and Node.js/Express/MongoDB (backend).

## Project Structure

```
employee-management-backend/      # Express API server
employee-management-frontend/     # Angular client app
```

## Backend

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Port:** 5000
- **Features:** CRUD operations for employees, auto-generated employee IDs, input validation

### Setup

```bash
cd employee-management-backend
npm install
npm run dev
```

### Environment

Create a `.env` file in the backend folder:

```
MONGODB_URI=mongodb://localhost:27017/employeeManagement
PORT=5000
```

## Frontend

- **Framework:** Angular 22
- **Port:** 4200
- **Features:** Dashboard with stats, employee list with column visibility, add/edit forms, responsive layout

### Setup

```bash
cd employee-management-frontend
npm install
ng serve
```

## Scripts

**Backend:**
- `npm start` - Start server
- `npm run dev` - Start with nodemon

**Frontend:**
- `ng serve` - Start dev server
- `ng build` - Build for production

## License

MIT
