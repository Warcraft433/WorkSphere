package com.worksphere.backend.service;

import com.worksphere.backend.entity.Document;
import com.worksphere.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {
    
    private final DocumentRepository repository;
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    public List<Document> findAll() { return repository.findAll(); }
    public Document findById(Long id) { return repository.findById(id).orElse(null); }
    
    public Document save(Document entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }

    public Document uploadDocument(MultipartFile file, Document documentMeta) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        documentMeta.setFilePath(filePath.toString());
        documentMeta.setUploadedOn(LocalDateTime.now());
        return repository.save(documentMeta);
    }
}
