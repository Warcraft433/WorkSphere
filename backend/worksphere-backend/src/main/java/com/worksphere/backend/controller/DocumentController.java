package com.worksphere.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.worksphere.backend.entity.Document;
import com.worksphere.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {
    
    private final DocumentService service;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public List<Document> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Document getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("meta") String metaJson) {
        try {
            Document documentMeta = objectMapper.readValue(metaJson, Document.class);
            Document savedDoc = service.uploadDocument(file, documentMeta);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }
}
