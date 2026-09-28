# JobTrack

Công cụ theo dõi quá trình ứng tuyển việc làm full-stack — quản lý mọi đơn ứng tuyển từ lúc lưu đến khi nhận offer.

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

JobTrack là một "CRM cá nhân" cho quá trình tìm việc: theo dõi đơn ứng tuyển trên bảng kanban, lưu lại toàn bộ lịch sử trạng thái, nhắc bạn khi đến hạn follow-up, quản lý và đính kèm các phiên bản CV, và nhìn toàn cảnh quá trình tìm việc qua các biểu đồ thống kê.

## Tính năng

**Pipeline ứng tuyển**

- Theo dõi đơn ứng tuyển với công ty, vị trí, trạng thái, mức lương, link tin tuyển dụng, ngày ứng tuyển, ngày follow-up, ghi chú và CV đính kèm.
- Bảng kanban kéo-thả cùng danh sách có tìm kiếm, lọc và phân trang.
- Lịch sử trạng thái đầy đủ — mọi thay đổi (SAVED → APPLIED → INTERVIEWING → OFFERED / REJECTED) đều được ghi log kèm thời gian và ghi chú tùy chọn.

**Nhắc follow-up**

- Đặt ngày follow-up cho từng đơn; các đơn đến hạn sẽ hiển thị trong trung tâm nhắc nhở ở Dashboard.

**Thư viện CV**

- Tải lên file PDF/DOCX (tối đa 10 MB), kiểm tra 3 lớp: phần mở rộng, MIME type khai báo và nội dung thật bằng Apache Tika để chặn file ngụy trang.
- Tải xuống, xóa và đính kèm CV vào đơn ứng tuyển.

**Thống kê & xuất dữ liệu**

- Tổng số đơn, phân bố theo trạng thái và số đơn theo tháng qua biểu đồ.
- Xuất toàn bộ danh sách đơn ứng tuyển ra CSV hoặc Excel (XLSX).

**Tài khoản & bảo mật**

- Xác thực JWT (stateless), mật khẩu băm bằng BCrypt.
- Giới hạn tần suất theo IP: 10 req/phút cho các endpoint auth, 20 req/phút cho upload CV.
- Đổi email hoặc mật khẩu đều bắt buộc nhập mật khẩu hiện tại.
- Frontend tự đăng xuất và chuyển về `/login` khi gặp lỗi 401/403.

## Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Backend | Java 17, Spring Boot 4.1 (Web MVC, Security, Data JPA, Validation, Actuator), Flyway, MySQL 8.4, jjwt 0.12, Apache POI (XLSX), Apache Tika (nhận diện file), Lombok |
| Frontend | React 19, TypeScript, Vite 8, React Router 7, Tailwind CSS 4, react-hook-form + Zod, axios, Recharts, lucide-react |
| Kiểm thử | JUnit 5, Mockito, AssertJ |
| Hạ tầng | Docker Compose (MySQL + API), cấu hình qua `.env` |

## Cấu trúc dự án

```
jobtrack-system
├── backend/                      # REST API Spring Boot
│   ├── src/main/java/com/jobtrack/backend/
│   │   ├── controller/           # REST controllers + xử lý lỗi toàn cục
│   │   ├── service/              # logic nghiệp vụ
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── entity/               # JPA entities và enums
│   │   ├── dto/                  # request/response records
│   │   └── security/             # JWT filter, rate limiting, cấu hình security
│   ├── src/main/resources/
│   │   ├── db/migration/         # Flyway migrations (V1, V2)
│   │   └── application*.properties
│   └── Dockerfile
├── frontend/                     # SPA React
│   ├── src/
│   │   ├── pages/                # các màn hình (Login, Dashboard, Applications, ...)
│   │   ├── components/           # kanban board, modal, trung tâm nhắc nhở, ...
│   │   ├── services/             # axios API clients có type
│   │   ├── context/              # trạng thái đăng nhập (AuthContext)
│   │   └── layouts/              # khung ứng dụng (sidebar + navbar)
│   └── public/
├── design-system/                # tài liệu hướng dẫn thiết kế UI
├── docker-compose.yml            # MySQL + backend
└── .env.example                  # mẫu các biến bí mật
```

## Bắt đầu

### Yêu cầu

- Java 17+
- Node.js `^20.19.0 || >=22.12.0`
- MySQL 8+ (hoặc Docker)

### 1. Chạy backend (profile dev)

```bash
cd backend
./mvnw spring-boot:run
```

- API tại **http://localhost:8080**.
- Profile `dev` được bật mặc định; database `jobtrack_db` tự tạo ở lần chạy đầu và Flyway tự áp dụng migrations.
- Mặc định khi dev: CORS cho phép mọi port `localhost`/`127.0.0.1`, JWT dùng secret fallback chỉ dành cho dev (đặt `JWT_SECRET` để ghi đè).

### 2. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Mở **http://localhost:5173**. Frontend gọi `http://localhost:8080/api/v1` mặc định — ghi đè bằng `VITE_API_URL`.

### 3. Hoặc chạy toàn bộ bằng Docker Compose

```bash
cp .env.example .env                        # điền các secret
cd backend && ./mvnw package -DskipTests && cd ..
docker compose up --build
```

Khởi động MySQL 8.4 (port 3306) và API (port 8080, profile `prod`). API đợi MySQL healthcheck xong mới chạy. Image backend yêu cầu jar đã build sẵn trong `backend/target/`.

## Cấu hình

| Biến | Mô tả | Mặc định khi dev |
|------|-------|------------------|
| `SPRING_PROFILES_ACTIVE` | Profile đang chạy (`dev` / `prod`) | `dev` |
| `DB_URL` | JDBC connection URL | `jdbc:mysql://localhost:3306/jobtrack_db?...` |
| `DB_USERNAME` / `DB_PASSWORD` | Tài khoản database | `root` / *(trống)* |
| `JWT_SECRET` | Khóa ký HMAC, từ 32 ký tự | fallback chỉ dùng khi dev; **bắt buộc** ở prod |
| `JWT_EXPIRATION_MS` | Thời hạn token (ms) | `86400000` (24 giờ); prod mặc định 1 giờ |
| `CORS_ALLOWED_ORIGINS` | Danh sách origin được phép, phân cách bằng dấu phẩy; hỗ trợ wildcard như `http://localhost:*` | `http://localhost:*,http://127.0.0.1:*` |
| `UPLOAD_DIRECTORY` | Thư mục lưu CV | `uploads/cvs` |
| `VITE_API_URL` | URL gốc API của frontend | `http://localhost:8080/api/v1` |
| `MYSQL_ROOT_PASSWORD` | Mật khẩu root MySQL (chỉ khi dùng Compose) | — |

`.env` đã được gitignore; `.env.example` liệt kê đủ các key mà stack Compose cần.

## Tổng quan API

Base URL: `/api/v1`. Mọi endpoint trừ `/auth/**` đều yêu cầu header `Authorization: Bearer <token>`.

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/auth/register` | Tạo tài khoản, trả về JWT |
| `POST` | `/auth/login` | Đăng nhập, trả về JWT |
| `GET` | `/users/me` | Thông tin người dùng hiện tại |
| `PUT` | `/users/profile` | Cập nhật email / họ tên / mật khẩu |
| `GET` | `/applications` | Danh sách đơn (`status`, `search`, `page`, `size`) |
| `POST` | `/applications` | Tạo đơn ứng tuyển |
| `GET` | `/applications/{id}` | Chi tiết đơn kèm lịch sử trạng thái |
| `PUT` | `/applications/{id}` | Cập nhật đơn ứng tuyển |
| `PATCH` | `/applications/{id}/status` | Đổi trạng thái (ghi vào lịch sử) |
| `DELETE` | `/applications/{id}` | Xóa đơn ứng tuyển |
| `GET` | `/applications/follow-ups` | Các đơn có ngày follow-up |
| `GET` | `/applications/analytics` | Tổng hợp: tổng số, theo trạng thái, theo tháng |
| `GET` | `/applications/export` | Xuất CSV hoặc XLSX (`?format=csv\|xlsx`) |
| `POST` | `/cvs/upload` | Tải lên CV (PDF/DOCX, tối đa 10 MB) |
| `GET` | `/cvs` | Danh sách CV đã tải lên |
| `GET` | `/cvs/{id}/download` | Tải xuống CV |
| `DELETE` | `/cvs/{id}` | Xóa CV |

Actuator expose `health` và `info` (yêu cầu xác thực).

## Kiểm thử

```bash
cd backend
./mvnw test
```

8 test: unit test cho logic ghi log trạng thái đơn ứng tuyển và quy tắc cập nhật hồ sơ (JUnit 5 + Mockito + AssertJ), cùng 1 test khởi động context — cần MySQL đang chạy.

```bash
cd frontend
npm run build     # kiểm tra type + build production
npm run lint
```

## Ghi chú bảo mật

- Xác thực JWT stateless (ký HMAC-SHA); mật khẩu băm bằng BCrypt.
- Giới hạn tần suất theo IP với cửa sổ cố định 60 giây.
- Allowlist CORS cấu hình hoàn toàn qua biến môi trường; wildcard origin chỉ hoạt động ở nơi bạn chủ động cấu hình.
- File CV được kiểm tra 3 lớp và trả về kèm header `X-Content-Type-Options: nosniff`.
- Profile `prod` dừng ngay khi thiếu `JWT_SECRET`, `DB_URL`, `DB_USERNAME` hoặc `DB_PASSWORD`; không có secret nào bị commit vào repo.
- Exception handler toàn cục trả về thông báo đã lọc thông tin nhạy cảm, stack trace chỉ ghi ở log server.

## Tác giả

Được xây dựng bởi [itkhair05](https://github.com/itkhair05).
