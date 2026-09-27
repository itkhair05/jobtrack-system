package com.jobtrack.backend.controller;

import com.jobtrack.backend.service.ExportService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/applications")
public class ExportController {

    private static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "csv") String format) {
        boolean xlsx = "xlsx".equalsIgnoreCase(format);
        if (!xlsx && !"csv".equalsIgnoreCase(format)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Format must be csv or xlsx");
        }
        byte[] content = exportService.export(email, format);
        String extension = xlsx ? "xlsx" : "csv";
        MediaType mediaType = xlsx ? XLSX : MediaType.parseMediaType("text/csv;charset=UTF-8");
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename("jobtrack-applications." + extension)
                .build();
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(content);
    }
}
