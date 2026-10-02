package com.worksphere.backend.controller;
import com.worksphere.backend.entity.LeaveRequest;
import com.worksphere.backend.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leaverequests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaveRequestController {
    private final LeaveRequestService service;

    @GetMapping
    public List<LeaveRequest> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public LeaveRequest getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public LeaveRequest create(@RequestBody LeaveRequest entity) { return service.save(entity); }

    @PutMapping("/{id}")
    public LeaveRequest update(@PathVariable Long id, @RequestBody LeaveRequest entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }
}
