# School Vaccination Portal API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints except `/auth/login` require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Login

-   **URL**: `/auth/login`
-   **Method**: `POST`
-   **Description**: Authenticate a user and get a JWT token
-   **Request Body**:
    ```json
    {
        "username": "string",
        "password": "string"
    }
    ```
-   **Response**:
    ```json
    {
        "token": "string",
        "user": {
            "id": "number",
            "username": "string",
            "role": "string"
        }
    }
    ```

### Users

#### Get All Users

-   **URL**: `/users`
-   **Method**: `GET`
-   **Description**: Get all users (Admin only)
-   **Headers**:
    -   Authorization: Bearer token
-   **Response**: Array of user objects

#### Get User by ID

-   **URL**: `/users/:id`
-   **Method**: `GET`
-   **Description**: Get a user by ID (Admin only)
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: User ID
-   **Response**: User object

#### Create User

-   **URL**: `/users`
-   **Method**: `POST`
-   **Description**: Create a new user (Admin only)
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **Request Body**:
    ```json
    {
        "username": "string",
        "password": "string",
        "role": "string"
    }
    ```
-   **Response**: Created user object

#### Update User

-   **URL**: `/users/:id`
-   **Method**: `PUT`
-   **Description**: Update an existing user (Admin only)
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **URL Parameters**:
    -   id: User ID
-   **Request Body**:
    ```json
    {
        "username": "string",
        "password": "string",
        "role": "string"
    }
    ```
-   **Response**: Updated user object

#### Delete User

-   **URL**: `/users/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a user (Admin only)
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: User ID
-   **Response**: Success message

### Students

#### Get All Students

-   **URL**: `/students`
-   **Method**: `GET`
-   **Description**: Get a paginated list of students with optional filtering
-   **Headers**:
    -   Authorization: Bearer token
-   **Query Parameters**:
    -   page: number (default: 1)
    -   limit: number (default: 10)
    -   name: string (optional)
    -   studentId: string (optional)
    -   class: string (optional)
-   **Response**:
    ```json
    {
        "students": [
            {
                "id": "number",
                "name": "string",
                "studentId": "string",
                "class": "string"
            }
        ],
        "total": "number",
        "page": "number"
    }
    ```

#### Get Student by ID

-   **URL**: `/students/:id`
-   **Method**: `GET`
-   **Description**: Get a single student by ID
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: Student ID
-   **Response**: Student object

#### Create Student

-   **URL**: `/students`
-   **Method**: `POST`
-   **Description**: Create a new student
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **Request Body**:
    ```json
    {
        "name": "string",
        "studentId": "string",
        "class": "string"
    }
    ```
-   **Response**: Created student object

#### Update Student

-   **URL**: `/students/:id`
-   **Method**: `PUT`
-   **Description**: Update an existing student
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **URL Parameters**:
    -   id: Student ID
-   **Request Body**:
    ```json
    {
        "name": "string",
        "studentId": "string",
        "class": "string"
    }
    ```
-   **Response**: Updated student object

#### Delete Student

-   **URL**: `/students/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a student (Admin only)
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: Student ID
-   **Response**: Success message

#### Import Students from CSV

-   **URL**: `/students/import`
-   **Method**: `POST`
-   **Description**: Import multiple students from a CSV file
-   **Headers**:
    -   Authorization: Bearer token
-   **Request**: Form data
    -   file: CSV file
-   **Response**: Import results

### Vaccination Drives

#### Get All Vaccination Drives

-   **URL**: `/vaccination-drives`
-   **Method**: `GET`
-   **Description**: Get a paginated list of vaccination drives
-   **Headers**:
    -   Authorization: Bearer token
-   **Query Parameters**:
    -   upcoming: boolean (optional)
    -   page: number (default: 1)
    -   limit: number (default: 10)
    -   name: string (optional)
    -   class: string (optional)
    -   status: string (optional)
-   **Response**:
    ```json
    {
        "vaccinationDrives": [
            {
                "id": "number",
                "name": "string",
                "date": "string (ISO date)",
                "availableDoses": "number",
                "applicableClasses": ["string"]
            }
        ],
        "total": "number",
        "page": "number"
    }
    ```

#### Get Vaccination Drive by ID

-   **URL**: `/vaccination-drives/:id`
-   **Method**: `GET`
-   **Description**: Get a single vaccination drive by ID
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: Vaccination Drive ID
-   **Response**: Vaccination drive object

#### Create Vaccination Drive

-   **URL**: `/vaccination-drives`
-   **Method**: `POST`
-   **Description**: Create a new vaccination drive
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **Request Body**:
    ```json
    {
        "name": "string",
        "date": "string (ISO date)",
        "availableDoses": "number",
        "applicableClasses": ["string"]
    }
    ```
-   **Response**: Created vaccination drive object

#### Update Vaccination Drive

-   **URL**: `/vaccination-drives/:id`
-   **Method**: `PUT`
-   **Description**: Update an existing vaccination drive
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **URL Parameters**:
    -   id: Vaccination Drive ID
-   **Request Body**:
    ```json
    {
        "name": "string",
        "date": "string (ISO date)",
        "availableDoses": "number",
        "applicableClasses": ["string"]
    }
    ```
-   **Response**: Updated vaccination drive object

#### Delete Vaccination Drive

-   **URL**: `/vaccination-drives/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a vaccination drive
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: Vaccination Drive ID
-   **Response**: Success message

### Vaccinations

#### Get All Vaccinations

-   **URL**: `/vaccinations`
-   **Method**: `GET`
-   **Description**: Get a paginated list of vaccinations
-   **Headers**:
    -   Authorization: Bearer token
-   **Query Parameters**:
    -   page: number (default: 1)
    -   limit: number (default: 10)
    -   studentId: number (optional)
    -   driveId: number (optional)
    -   vaccineName: string (optional)
    -   sortField: string (optional)
    -   sortDirection: string (optional)
-   **Response**: Array of vaccination objects

#### Get Vaccination by ID

-   **URL**: `/vaccinations/:id`
-   **Method**: `GET`
-   **Description**: Get a single vaccination by ID
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: Vaccination ID
-   **Response**: Vaccination object

#### Create Vaccination

-   **URL**: `/vaccinations`
-   **Method**: `POST`
-   **Description**: Record a new vaccination
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **Request Body**:
    ```json
    {
        "studentId": "number",
        "driveId": "number",
        "vaccinationDate": "string (ISO date)"
    }
    ```
-   **Response**: Created vaccination object

#### Update Vaccination

-   **URL**: `/vaccinations/:id`
-   **Method**: `PUT`
-   **Description**: Update an existing vaccination record
-   **Headers**:
    -   Authorization: Bearer token
    -   Content-Type: application/json
-   **URL Parameters**:
    -   id: Vaccination ID
-   **Request Body**:
    ```json
    {
        "studentId": "number",
        "driveId": "number",
        "vaccinationDate": "string (ISO date)"
    }
    ```
-   **Response**: Updated vaccination object

#### Delete Vaccination

-   **URL**: `/vaccinations/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a vaccination record
-   **Headers**:
    -   Authorization: Bearer token
-   **URL Parameters**:
    -   id: Vaccination ID
-   **Response**: Success message

#### Get Vaccination Statistics

-   **URL**: `/vaccinations/statistics`
-   **Method**: `GET`
-   **Description**: Get vaccination statistics for dashboard
-   **Headers**:
    -   Authorization: Bearer token
-   **Response**: Statistics object

### Reports

#### Generate Vaccination Report

-   **URL**: `/reports/vaccination`
-   **Method**: `GET`
-   **Description**: Generate a vaccination report
-   **Headers**:
    -   Authorization: Bearer token
-   **Response**: Report data or file download

## Error Responses

All endpoints may return the following error responses:

-   `400 Bad Request`: Invalid request parameters
-   `401 Unauthorized`: Missing or invalid authentication token
-   `403 Forbidden`: Insufficient permissions
-   `404 Not Found`: Resource not found
-   `409 Conflict`: Resource conflict
-   `500 Internal Server Error`: Server error

## Data Models

### User

```json
{
    "id": "number",
    "username": "string",
    "role": "string"
}
```

### Student

```json
{
    "id": "number",
    "name": "string",
    "studentId": "string",
    "class": "string"
}
```

### VaccinationDrive

```json
{
    "id": "number",
    "name": "string",
    "date": "string (ISO date)",
    "availableDoses": "number",
    "applicableClasses": ["string"]
}
```

### Vaccination

```json
{
    "id": "number",
    "studentId": "number",
    "driveId": "number",
    "vaccinationDate": "string (ISO date)"
}
```
