package com.worksphere.backend.service;

import com.worksphere.backend.entity.ActivityLog;
import com.worksphere.backend.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public void log(String actionType, String description, String actorUsername, Long affectedEntityId) {
        ActivityLog log = new ActivityLog();
        log.setActionType(actionType);
        log.setDescription(description);
        log.setActorUsername(actorUsername);
        log.setAffectedEntityId(affectedEntityId);
        repository.save(log);
    }

    public List<ActivityLog> getRecent(int limit) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }
}
