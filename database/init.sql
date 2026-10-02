-- Database Initialization Script for WorkSphere
-- The schema is automatically managed by Spring Boot Hibernate (ddl-auto=update).
-- This script provides some initial mock data.

USE worksphere_db;

-- Insert mock Departments
INSERT INTO department (name, location) VALUES 
('IT', 'New York'),
('HR', 'Chicago'),
('Finance', 'San Francisco'),
('Marketing', 'Los Angeles');

-- Insert mock Designations
INSERT INTO designation (name, department_id) VALUES 
('Software Engineer', 1),
('System Analyst', 1),
('HR Manager', 2),
('Accountant', 3),
('Marketing Executive', 4);

-- Insert mock Employees (assuming ids match)
INSERT INTO employee (first_name, last_name, email, phone, hire_date, salary, department_id, designation_id, manager_id) VALUES 
('John', 'Doe', 'john.doe@company.com', '9876543210', '2022-03-01', 2500.00, 1, 1, NULL),
('Sarah', 'Wilson', 'sarah.wilson@company.com', '1234567890', '2021-05-15', 3000.00, 2, 3, NULL),
('Michael', 'Brown', 'michael.brown@company.com', '5556667777', '2023-01-10', 2200.00, 3, 4, NULL);

-- Insert mock Users
INSERT INTO users (employee_id, username, password, role, status) VALUES 
(1, 'admin', 'password', 'ADMIN', true),
(2, 'hr_admin', 'password', 'HR', true),
(3, 'employee1', 'password', 'EMPLOYEE', true);

-- Insert mock Attendance
INSERT INTO attendance (employee_id, work_date, check_in, check_out, status) VALUES 
(1, '2024-05-16', '09:02:00', '18:05:00', 'PRESENT'),
(2, '2024-05-16', '08:55:00', '18:00:00', 'PRESENT');
