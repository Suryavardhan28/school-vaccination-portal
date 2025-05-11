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
-   **Status Codes**:
    -   `200 OK`: Login successful
    -   `400 Bad Request`: Missing username or password
    -   `401 Unauthorized`: Invalid credentials
    -   `500 Internal Server Error`: Server error

### Students

#### Get All Students

-   **URL**: `/students`
-   **Method**: `GET`
-   **Description**: Get a paginated list of students with optional filtering
-   **Query Parameters**:
    -   `name` (optional): Filter by student name
    -   `studentId` (optional): Filter by student ID
    -   `class` (optional): Filter by class
    -   `vaccinationStatus` (optional): Filter by vaccination status
    -   `page` (optional, default: 1): Page number
    -   `limit` (optional, default: 10): Items per page
-   **Response**:
    ```json
    {
        "total": "number",
        "totalPages": "number",
        "currentPage": "number",
        "students": [
            {
                "id": "number",
                "name": "string",
                "studentId": "string",
                "class": "string"
            }
        ]
    }
    ```

#### Get Student by ID

-   **URL**: `/students/:id`
-   **Method**: `GET`
-   **Description**: Get a single student by ID
-   **Response**:
    ```json
    {
        "id": "number",
        "name": "string",
        "studentId": "string",
        "class": "string"
    }
    ```

#### Create Student

-   **URL**: `/students`
-   **Method**: `POST`
-   **Description**: Create a new student
-   **Request Body**:
    ```json
    {
        "name": "string",
        "studentId": "string",
        "class": "string"
    }
    ```
-   **Response**: Created student object
-   **Status Codes**:
    -   `201 Created`: Student created successfully
    -   `400 Bad Request`: Missing required fields
    -   `409 Conflict`: Student ID already exists

#### Update Student

-   **URL**: `/students/:id`
-   **Method**: `PUT`
-   **Description**: Update an existing student
-   **Request Body**:
    ```json
    {
        "name": "string",
        "studentId": "string",
        "class": "string"
    }
    ```
-   **Response**: Updated student object
-   **Status Codes**:
    -   `200 OK`: Student updated successfully
    -   `404 Not Found`: Student not found
    -   `409 Conflict`: Student ID already exists

#### Delete Student

-   **URL**: `/students/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a student
-   **Response**:
    ```json
    {
        "message": "Student deleted successfully"
    }
    ```
-   **Status Codes**:
    -   `200 OK`: Student deleted successfully
    -   `404 Not Found`: Student not found

#### Import Students from CSV

-   **URL**: `/students/import`
-   **Method**: `POST`
-   **Description**: Import multiple students from a CSV file
-   **Request**: Form data with a CSV file
    -   `file`: CSV file with columns: name, studentId, class
-   **Response**:
    ```json
    {
        "message": "CSV import completed",
        "totalProcessed": "number",
        "successCount": "number",
        "errorCount": "number",
        "errors": ["string"]
    }
    ```

### Vaccination Drives

#### Get All Vaccination Drives

-   **URL**: `/vaccination-drives`
-   **Method**: `GET`
-   **Description**: Get a paginated list of vaccination drives
-   **Query Parameters**:
    -   `upcoming` (optional): Filter for upcoming drives (within next 30 days)
    -   `page` (optional, default: 1): Page number
    -   `limit` (optional, default: 10): Items per page
-   **Response**:
    ```json
    {
        "total": "number",
        "totalPages": "number",
        "currentPage": "number",
        "vaccinationDrives": [
            {
                "id": "number",
                "name": "string",
                "date": "string (ISO date)",
                "availableDoses": "number",
                "applicableClasses": ["string"]
            }
        ]
    }
    ```

#### Get Vaccination Drive by ID

-   **URL**: `/vaccination-drives/:id`
-   **Method**: `GET`
-   **Description**: Get a single vaccination drive by ID
-   **Response**: Vaccination drive object

#### Create Vaccination Drive

-   **URL**: `/vaccination-drives`
-   **Method**: `POST`
-   **Description**: Create a new vaccination drive
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
-   **Status Codes**:
    -   `201 Created`: Drive created successfully
    -   `400 Bad Request`: Missing required fields or invalid date
    -   `409 Conflict`: Another drive already scheduled for this date

#### Update Vaccination Drive

-   **URL**: `/vaccination-drives/:id`
-   **Method**: `PUT`
-   **Description**: Update an existing vaccination drive
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
-   **Status Codes**:
    -   `200 OK`: Drive updated successfully
    -   `400 Bad Request`: Cannot edit past drives
    -   `404 Not Found`: Drive not found
    -   `409 Conflict`: Another drive already scheduled for this date

#### Delete Vaccination Drive

-   **URL**: `/vaccination-drives/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a vaccination drive
-   **Response**:
    ```json
    {
        "message": "Vaccination drive deleted successfully"
    }
    ```
-   **Status Codes**:
    -   `200 OK`: Drive deleted successfully
    -   `400 Bad Request`: Cannot delete past drives
    -   `404 Not Found`: Drive not found

### Vaccinations

#### Get All Vaccinations

-   **URL**: `/vaccinations`
-   **Method**: `GET`
-   **Description**: Get a list of vaccinations
-   **Response**: Array of vaccination objects

#### Get Vaccination by ID

-   **URL**: `/vaccinations/:id`
-   **Method**: `GET`
-   **Description**: Get a single vaccination by ID
-   **Response**: Vaccination object

#### Create Vaccination

-   **URL**: `/vaccinations`
-   **Method**: `POST`
-   **Description**: Record a new vaccination
-   **Request Body**:
    ```json
    {
        "studentId": "number",
        "vaccinationDriveId": "number",
        "vaccineName": "string",
        "doseNumber": "number",
        "date": "string (ISO date)"
    }
    ```
-   **Response**: Created vaccination object

#### Delete Vaccination

-   **URL**: `/vaccinations/:id`
-   **Method**: `DELETE`
-   **Description**: Delete a vaccination record
-   **Response**:
    ```json
    {
        "message": "Vaccination deleted successfully"
    }
    ```

#### Get Vaccination Statistics

-   **URL**: `/vaccinations/statistics`
-   **Method**: `GET`
-   **Description**: Get vaccination statistics
-   **Response**: Statistics object with vaccination data

### Reports

#### Generate Vaccination Report

-   **URL**: `/reports/vaccination-report`
-   **Method**: `GET`
-   **Description**: Generate a vaccination report
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
    "vaccinationDriveId": "number",
    "vaccineName": "string",
    "doseNumber": "number",
    "date": "string (ISO date)"
}
```
