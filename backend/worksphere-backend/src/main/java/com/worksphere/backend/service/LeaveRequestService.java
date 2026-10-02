package com.worksphere.backend.service;

import com.worksphere.backend.entity.LeaveRequest;
import com.worksphere.backend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {
    
    private final LeaveRequestRepository repository;

    public List<LeaveRequest> findAll() { return repository.findAll(); }
    public LeaveRequest findById(Long id) { return repository.findById(id).orElse(null); }
    
    public LeaveRequest save(LeaveRequest request) { 
        if (request.getAppliedOn() == null) {
            request.setAppliedOn(LocalDateTime.now());
        }
        if (request.getStatus() == null) {
            request.setStatus(LeaveRequest.Status.PENDING);
        }

        // Complex Logic: Check Date Overlaps
        List<LeaveRequest> existingLeaves = repository.findAll().stream()
                .filter(l -> l.getEmployee().getId().equals(request.getEmployee().getId()))
                .filter(l -> l.getStatus() == LeaveRequest.Status.APPROVED)
                .toList();

        for (LeaveRequest existing : existingLeaves) {
            if (!request.getStartDate().isAfter(existing.getEndDate()) && 
                !request.getEndDate().isBefore(existing.getStartDate())) {
                throw new IllegalArgumentException("Leave dates overlap with an already approved leave.");
            }
        }
        
        return repository.save(request); 
    }
    
    public void deleteById(Long id) { repository.deleteById(id); }
}
