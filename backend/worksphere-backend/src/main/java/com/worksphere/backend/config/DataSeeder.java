package com.worksphere.backend.config;

import com.worksphere.backend.entity.User;
import com.worksphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.worksphere.backend.entity.Department;
import com.worksphere.backend.repository.DepartmentRepository;
import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin") == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); // Default secure password
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(true);
            userRepository.save(admin);
            System.out.println("Default Admin user created successfully.");
        }

        if (departmentRepository.count() == 0) {
            Department eng = new Department(); eng.setName("Engineering"); eng.setLocation("San Francisco"); departmentRepository.save(eng);
            Department hr = new Department(); hr.setName("Human Resources"); hr.setLocation("New York"); departmentRepository.save(hr);
            Department sales = new Department(); sales.setName("Sales"); sales.setLocation("Chicago"); departmentRepository.save(sales);
            System.out.println("Departments seeded.");
        }

        if (employeeRepository.count() == 0) {
            String[][] empData = {
                {"Sarah", "Connor", "sarah.connor@worksphere.com", "Engineering", "120000"},
                {"John", "Smith", "john.smith@worksphere.com", "Sales", "85000"},
                {"Emily", "Davis", "emily.davis@worksphere.com", "Human Resources", "75000"},
                {"Michael", "Scott", "michael.scott@worksphere.com", "Sales", "95000"},
                {"Dwight", "Schrute", "dwight.schrute@worksphere.com", "Sales", "80000"},
                {"Jim", "Halpert", "jim.halpert@worksphere.com", "Sales", "78000"},
                {"Pam", "Beesly", "pam.beesly@worksphere.com", "Human Resources", "65000"},
                {"Angela", "Martin", "angela.martin@worksphere.com", "Engineering", "110000"},
                {"Kevin", "Malone", "kevin.malone@worksphere.com", "Engineering", "95000"},
                {"Oscar", "Martinez", "oscar.martinez@worksphere.com", "Engineering", "115000"}
            };
            
            for (int i = 0; i < empData.length; i++) {
                Employee emp = new Employee();
                emp.setFirstName(empData[i][0]);
                emp.setLastName(empData[i][1]);
                emp.setEmail(empData[i][2]);
                emp.setPhone("555-010" + i);
                emp.setHireDate(LocalDate.now().minusDays((i + 1) * 30));
                emp.setSalary(Double.parseDouble(empData[i][4]));
                Employee savedEmp = employeeRepository.save(emp);
                
                // Create user account for them
                User user = new User();
                user.setUsername(emp.getEmail()); // Username is their email
                user.setPassword(passwordEncoder.encode("password123")); // Real-world default password for new hires
                user.setRole(User.Role.EMPLOYEE);
                user.setStatus(true);
                user.setEmployee(savedEmp);
                userRepository.save(user);
            }
            System.out.println("Seeding complete: 10 realistic employees added with user accounts.");
        }
    }
}
