package com.worksphere.backend.repository;

import com.worksphere.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByWorkDate(LocalDate workDate);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :empId AND a.workDate = :date")
    List<Attendance> findByEmployeeIdAndWorkDate(@Param("empId") Long empId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :empId AND a.checkOut IS NULL ORDER BY a.workDate DESC")
    Optional<Attendance> findActiveClockIn(@Param("empId") Long empId);
}
