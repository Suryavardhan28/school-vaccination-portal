# School Vaccination Portal

A full-stack web application for managing and tracking vaccination drives in a school.

## Features

- **Authentication**: School coordinator (admin) login system
- **Dashboard**: Display key metrics including student vaccination rates and upcoming drives
- **Student Management**: Add/edit students individually and import via CSV
- **Vaccination Drive Management**: Schedule and manage vaccination drives
- **Vaccination Management**: Record student vaccinations and prevent duplicates
- **Reports**: Generate vaccination reports with filtering options

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Material UI for components
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express
- TypeScript
- SQLite database with Sequelize ORM
- JSON Web Tokens (JWT) for authentication

## Project Structure

```
school-vaccination-portal/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── ...
│   └── ...
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Request handlers
│   │   ├── middlewares/# Express middlewares
│   │   ├── models/     # Sequelize models
│   │   ├── routes/     # API routes
│   │   ├── seeders/    # Sample data seeders
│   │   └── ...
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js 16+
- Bun (recommended)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/school-vaccination-portal.git
cd school-vaccination-portal
```

2. Install dependencies for both frontend and backend
```
bun run install:all
```

### Running the Application

1. Start both the backend and frontend servers
```
bun run dev
```

This will start:
- Backend server at http://localhost:3000
- Frontend development server at http://localhost:5173

### Seeding the Database

The application automatically seeds the database with sample data when running in development mode. If you want to manually seed the database:

```
bun run seed
```

### Reset Database

If you want to reset the database:

```
bun run reset-db
```

### Default Credentials

- Username: admin
- Password: password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password

### Students
- `GET /api/students` - Get all students with pagination and filtering
- `GET /api/students/:id` - Get a student by ID
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student
- `POST /api/students/import` - Import students from CSV

### Vaccination Drives
- `GET /api/vaccination-drives` - Get all vaccination drives
- `GET /api/vaccination-drives/:id` - Get a vaccination drive by ID
- `POST /api/vaccination-drives` - Create a new vaccination drive
- `PUT /api/vaccination-drives/:id` - Update a vaccination drive
- `DELETE /api/vaccination-drives/:id` - Delete a vaccination drive

### Vaccinations
- `GET /api/vaccinations` - Get all vaccinations with pagination and filtering
- `GET /api/vaccinations/:id` - Get a vaccination by ID
- `POST /api/vaccinations` - Record a new vaccination
- `DELETE /api/vaccinations/:id` - Delete a vaccination record
- `GET /api/vaccinations/statistics` - Get vaccination statistics for dashboard

## Building for Production

```
bun run build
```

This will build both the frontend and backend for production use.

## License

This project is licensed under the MIT License. 