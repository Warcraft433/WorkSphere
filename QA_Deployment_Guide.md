# 🚀 WorkSphere QA Testing & Deployment Guide

This document outlines the final QA procedures to run locally before pushing your code, followed by the exact steps to deploy to Render and Vercel for free.

---

## Part 1: Backend API Verification (cURL Scripts)

Open your terminal and run these commands sequentially to verify core business logic.

### 1. Login & Retrieve JWT
```bash
curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```
*(Copy the `token` from the response for the following commands. Replace `<YOUR_TOKEN>` below with it.)*

### 2. Verify Leave Request Logic (Overlapping Dates)
First, submit a valid leave request for Employee ID 1 (Assuming Employee 1 exists from our seeder):
```bash
curl -X POST http://localhost:8080/api/leaves \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-d "{\"employeeId\": 1, \"type\": \"VACATION\", \"startDate\": \"2026-12-01\", \"endDate\": \"2026-12-10\", \"reason\": \"Holiday\"}"
```
Next, submit an overlapping leave request to verify the backend throws a `400 Bad Request`:
```bash
curl -X POST http://localhost:8080/api/leaves \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-d "{\"employeeId\": 1, \"type\": \"SICK\", \"startDate\": \"2026-12-05\", \"endDate\": \"2026-12-06\", \"reason\": \"Flu\"}"
```
*(Expected: `400 Bad Request` with message "Leave dates overlap with an existing approved request")*

### 3. Verify Attendance (Clock In / Clock Out)
Clock In:
```bash
curl -X POST http://localhost:8080/api/attendance/clock-in?employeeId=1 \
-H "Authorization: Bearer <YOUR_TOKEN>"
```
Clock Out (Wait a few seconds first!):
```bash
curl -X PUT http://localhost:8080/api/attendance/clock-out?employeeId=1 \
-H "Authorization: Bearer <YOUR_TOKEN>"
```

### 4. Trigger Payroll Generation
```bash
curl -X POST http://localhost:8080/api/payroll/generate \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-d "{\"employeeId\": 1, \"month\": 10, \"year\": 2026, \"allowances\": 500.00, \"deductions\": 50.00}"
```
*(Expected: A complete Payroll JSON object with `netSalary` accurately calculated.)*

---

## Part 2: Frontend E2E Manual Test Plan

Open `login.html` via Live Server and manually execute these tests:

### 1. Role-Based Access Control (RBAC) Test
- In your database, ensure one of the seeded users has `ROLE_EMPLOYEE`. (If not, create one manually or just test the logic concept).
- **Log in as an Employee.**
- **Verify:** The sidebar should instantly hide "Payroll", "Departments", and "Settings".

### 2. Pagination Button Logic
- Navigate to the **Employees** page.
- **Verify:** The "Previous" button is disabled on Page 1.
- **Action:** If you have more than 10 employees, click "Next". Verify "Previous" becomes enabled. If you have 5 employees, verify "Next" is disabled.

### 3. File Upload Success
- Navigate to the **Documents** page.
- **Action:** Select a small PDF or PNG file, assign it to an employee, and click upload.
- **Verify:** The success Toast appears, and the file instantly populates in the data table below.

### 4. JWT & Auto-Logout Security
- Navigate to **Settings**.
- **Action:** Change your password.
- **Verify:** The system waits 2 seconds and automatically logs you out, clearing `localStorage`. You should be redirected to `login.html` and forced to use the new password.

---

## Part 3: Pre-Deployment Configuration Audit

Before you run `git push`, open VS Code and strictly audit these 3 files:

### 1. `script.js` (Frontend)
Locate line 1 and 2:
```javascript
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
const API_BASE_URL = IS_LOCAL 
    ? 'http://localhost:8080/api' 
    : 'https://worksphere-backend.onrender.com/api'; // <--- Ensure this points to your Render URL!
```

### 2. `SecurityConfig.java` (Backend)
Locate your `CorsConfigurationSource` bean:
```java
configuration.setAllowedOrigins(List.of("http://localhost:5500", "http://127.0.0.1:5500", "https://worksphere.vercel.app")); // <--- Ensure your Vercel URL is here!
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
```

### 3. `application.properties` (Backend)
Locate your MySQL connection block. Do NOT push `localhost:3306` if you are deploying to Render!
```properties
spring.datasource.url=jdbc:mysql://your-cloud-db-url:3306/worksphere_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YourSecurePassword
spring.jpa.hibernate.ddl-auto=update
```

---

## Part 4: Vercel & Render Deployment Guide

### Deploying the Database (Render)
1. Go to [Render.com](https://render.com/) -> New -> **PostgreSQL** or **MySQL**. *(Note: Render natively supports free PostgreSQL. If you specifically need MySQL, use a free tier on **Aiven** or **Railway.app**).*
2. Copy the external Database URL, Username, and Password.
3. Paste them into your `application.properties`.

### Deploying the Backend (Render)
1. Push your entire repository to GitHub.
2. In Render, click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. **Root Directory:** Type `backend/worksphere-backend`
5. **Environment:** Java
6. **Build Command:** `mvn clean package -DskipTests`
7. **Start Command:** `java -jar target/worksphere-backend-0.0.1-SNAPSHOT.jar`
8. Click **Deploy**. Render will generate a URL (e.g., `https://worksphere-backend.onrender.com`).
9. *CRITICAL: Copy this URL and paste it into your frontend's `script.js`, then commit/push that change.*

### Deploying the Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and click **Add New** -> **Project**.
2. Connect your GitHub repository.
3. **Root Directory:** Click "Edit" and select `frontend/worksphere-frontend`.
4. **Framework Preset:** Leave as "Other" (since it's Vanilla HTML/JS).
5. Click **Deploy**.
6. *CRITICAL: Copy the Vercel URL (e.g., `https://worksphere.vercel.app`) and paste it into your backend's `SecurityConfig.java` CORS block. Commit, push, and let Render auto-redeploy.*

You now have a fully secure, scalable, cloud-hosted application!
