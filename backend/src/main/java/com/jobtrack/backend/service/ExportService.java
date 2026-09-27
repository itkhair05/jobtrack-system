package com.jobtrack.backend.service;

import com.jobtrack.backend.entity.Application;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.ApplicationRepository;
import com.jobtrack.backend.repository.UserRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ExportService(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public byte[] export(String email, String format) {
        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
        List<Application> applications = applicationRepository
                .searchByUser(user.getId(), null, null, Pageable.unpaged()).getContent();
        try {
            return "xlsx".equalsIgnoreCase(format) ? toXlsx(applications) : toCsv(applications);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not export applications", exception);
        }
    }

    private byte[] toCsv(List<Application> applications) {
        StringBuilder csv = new StringBuilder("Company,Job Title,Status,Applied Date,Salary Range,Job URL,Notes\r\n");
        for (Application application : applications) {
            csv.append(csvCell(application.getCompany().getName())).append(',')
                    .append(csvCell(application.getJobTitle())).append(',')
                    .append(csvCell(application.getStatus().name())).append(',')
                    .append(csvCell(application.getAppliedDate() == null ? "" : DATE_FORMAT.format(application.getAppliedDate()))).append(',')
                    .append(csvCell(application.getSalaryRange())).append(',')
                    .append(csvCell(application.getJobUrl())).append(',')
                    .append(csvCell(application.getNotes())).append("\r\n");
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] toXlsx(List<Application> applications) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Applications");
            String[] headers = {"Company", "Job Title", "Status", "Applied Date", "Salary Range", "Job URL", "Notes"};
            Row header = sheet.createRow(0);
            for (int index = 0; index < headers.length; index++) header.createCell(index).setCellValue(headers[index]);
            for (int rowIndex = 0; rowIndex < applications.size(); rowIndex++) {
                Application application = applications.get(rowIndex);
                Row row = sheet.createRow(rowIndex + 1);
                row.createCell(0).setCellValue(application.getCompany().getName());
                row.createCell(1).setCellValue(application.getJobTitle());
                row.createCell(2).setCellValue(application.getStatus().name());
                row.createCell(3).setCellValue(application.getAppliedDate() == null ? "" : DATE_FORMAT.format(application.getAppliedDate()));
                row.createCell(4).setCellValue(valueOrEmpty(application.getSalaryRange()));
                row.createCell(5).setCellValue(valueOrEmpty(application.getJobUrl()));
                row.createCell(6).setCellValue(valueOrEmpty(application.getNotes()));
            }
            for (int index = 0; index < headers.length; index++) sheet.autoSizeColumn(index);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private String csvCell(String value) {
        if (value == null) return "";
        String safe = value.replace("\"", "\"\"");
        if (safe.startsWith("=") || safe.startsWith("+") || safe.startsWith("-") || safe.startsWith("@")) safe = "'" + safe;
        return '"' + safe + '"';
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }
}
