# WorkSphere - Employment Management System

![Java 21](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-yellow?style=for-the-badge&logo=javascript)

WorkSphere is a comprehensive, production-ready Employment Management System. It features a secure RESTful API built on Spring Boot 3, and a sleek, dynamic frontend constructed entirely with Vanilla HTML, CSS, and JavaScript.

## 🚀 Key Features

*   **Stateless JWT Security:** Fully stateless authentication pipeline using JSON Web Tokens.
*   **Role-Based Access Control (RBAC):** UI elements and REST endpoints are dynamically restricted based on user roles (`ADMIN`, `EMPLOYEE`, `HR`).
*   **Complete HR Modules:** Manage Employees, Departments, Leaves, Payroll, and Attendance Tracking.
*   **Secure File Uploads:** Supports `multipart/form-data` uploads for storing critical employee documents (contracts, IDs).
*   **CSV Report Generation:** Streams raw binary data allowing admins to download employee analytics directly as CSV files using `OpenCSV`.
*   **Backend Pagination:** Implemented Spring Data JPA `Pageable` interfaces to efficiently load and display large datasets dynamically.

## 🛠️ How to Run Locally

### 1. Database Setup
Ensure you have MySQL installed and running locally on port `3306`.
No manual database creation or schema scripting is required! Spring Boot will automatically create the `worksphere_db` database and all relational tables for you on boot.

### 2. Start the Backend
Navigate to the backend directory and run the Maven application:
```bash
cd backend/worksphere-backend
mvn spring-boot:run
```
*Note: On the first successful boot, the `DataSeeder` class will automatically generate an Admin account and 5 random employees into the database.*

### 3. Start the Frontend
There is no complex Node.js build step! Simply open the project folder in VS Code, right-click `frontend/worksphere-frontend/login.html`, and select **Open with Live Server**.

Alternatively, you can just double-click `login.html` in your File Explorer to open it natively in your browser.

## 🔑 Default Login Credentials
Use the following credentials to access the Admin Dashboard:
*   **Username:** `admin`
*   **Password:** `admin123`

## ☁️ Deployment Guide

### Backend (Render / Railway)
1. Provision a free MySQL database on a cloud provider like Railway or PlanetScale.
2. In `src/main/resources/application.properties`, update `spring.datasource.url`, `username`, and `password` to point to your new cloud database.
3. In `SecurityConfig.java`, update the CORS `.setAllowedOrigins(...)` from `*` to your exact frontend domain (e.g., `https://worksphere.netlify.app`).
4. Connect your GitHub repository to Render/Railway and deploy. The provided `pom.xml` handles the rest!

### Frontend (Netlify / Vercel)
1. Open `frontend/worksphere-frontend/script.js`.
2. The `API_BASE_URL` is already configured to switch dynamically. Just replace the placeholder string with your new Render/Railway backend URL!
3. Drag and drop the `frontend/worksphere-frontend` folder into Netlify for an instant, free deployment!
