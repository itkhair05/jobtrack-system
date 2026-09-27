CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    website VARCHAR(255),
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_companies_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_companies_user_id (user_id)
);

CREATE TABLE cvs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cvs_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_cvs_user_id (user_id)
);

CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    cv_id BIGINT,
    job_title VARCHAR(150) NOT NULL,
    job_url TEXT,
    salary_range VARCHAR(100),
    status ENUM('SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED') DEFAULT 'SAVED',
    applied_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_applications_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_applications_cv
        FOREIGN KEY (cv_id) REFERENCES cvs (id),
    INDEX idx_applications_user_id (user_id)
);

CREATE TABLE application_status_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    note TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_status_logs_application
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    INDEX idx_application_status_logs_application_id (application_id)
);
