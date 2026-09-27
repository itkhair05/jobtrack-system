package com.jobtrack.backend.service;

import com.jobtrack.backend.dto.CvResponse;
import com.jobtrack.backend.entity.Cv;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.CvRepository;
import com.jobtrack.backend.repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CvService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final String PDF = "application/pdf";
    private static final String DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final Path uploadDirectory;

    public CvService(
            CvRepository cvRepository,
            UserRepository userRepository,
            @Value("${app.upload.directory:uploads/cvs}") String uploadDirectory) {
        this.cvRepository = cvRepository;
        this.userRepository = userRepository;
        this.uploadDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    @Transactional
    public CvResponse upload(String email, MultipartFile file, String title) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "CV file must be smaller than 10 MB");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "cv" : file.getOriginalFilename());
        String extension = extensionOf(originalName);
        if (!extension.equals("pdf") && !extension.equals("docx")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF and DOCX files are supported");
        }
        if (file.getContentType() != null && !file.getContentType().equals(PDF) && !file.getContentType().equals(DOCX)
                && !file.getContentType().equals("application/octet-stream")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid CV content type");
        }

        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
        String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "_" + safeName;
        Path destination = uploadDirectory.resolve(storedName).normalize();
        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store CV", exception);
        }

        Cv cv = new Cv();
        cv.setUser(user);
        cv.setTitle(title == null || title.isBlank() ? originalName : title.trim());
        cv.setFileName(originalName);
        cv.setFilePath(destination.toString());
        try {
            return toResponse(cvRepository.save(cv));
        } catch (RuntimeException exception) {
            deleteQuietly(destination);
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public DownloadedCv download(String email, Long id) {
        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
        Cv cv = cvRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found"));
        try {
            Path path = Paths.get(cv.getFilePath()).toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV file not found");
            }
            return new DownloadedCv(resource, contentType(cv.getFileName()), cv.getFileName());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV file not found", exception);
        }
    }

    private CvResponse toResponse(Cv cv) {
        return new CvResponse(cv.getId(), cv.getTitle(), cv.getFileName(), "/api/v1/cvs/" + cv.getId() + "/download", cv.getCreatedAt());
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String contentType(String filename) {
        return extensionOf(filename).equals("pdf") ? PDF : DOCX;
    }

    private void deleteQuietly(Path path) {
        try { Files.deleteIfExists(path); } catch (IOException ignored) { }
    }

    public record DownloadedCv(Resource resource, String contentType, String fileName) { }
}
