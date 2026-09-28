package com.jobtrack.backend.controller;

import com.jobtrack.backend.dto.CvResponse;
import com.jobtrack.backend.service.CvService;
import java.net.URI;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/cvs")
public class CvController {

    private final CvService cvService;

    public CvController(CvService cvService) {
        this.cvService = cvService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CvResponse> upload(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title) {
        CvResponse response = cvService.upload(email, file, title);
        return ResponseEntity.created(URI.create(response.downloadUrl())).body(response);
    }

    @GetMapping("/{id:\\d+}/download")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        CvService.DownloadedCv downloaded = cvService.download(email, id);
        ContentDisposition disposition = ContentDisposition.inline().filename(downloaded.fileName()).build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(downloaded.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(downloaded.resource());
    }

    @GetMapping
    public java.util.List<CvResponse> list(@AuthenticationPrincipal String email) {
        return cvService.list(email);
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email, @PathVariable Long id) {
        cvService.delete(email, id);
        return ResponseEntity.noContent().build();
    }
}
