package com.jobtrack.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();
    private final AtomicLong lastCleanup = new AtomicLong(System.currentTimeMillis());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        int limit = path.startsWith("/api/v1/auth/") ? 10 : path.equals("/api/v1/cvs/upload") ? 20 : 0;
        if (limit == 0) {
            chain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        cleanupExpired(now);
        String key = request.getRemoteAddr() + ":" + path;
        Counter counter = counters.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt > WINDOW_MILLIS) return new Counter(now, 1);
            return new Counter(current.startedAt, current.count + 1);
        });
        if (counter.count > limit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"timestamp\":\"" + Instant.now() + "\",\"status\":429,\"message\":\"Too many requests\",\"path\":\"" + path + "\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private void cleanupExpired(long now) {
        long previousCleanup = lastCleanup.get();
        if (now - previousCleanup < WINDOW_MILLIS || !lastCleanup.compareAndSet(previousCleanup, now)) return;
        counters.entrySet().removeIf(entry -> now - entry.getValue().startedAt > WINDOW_MILLIS);
    }

    private record Counter(long startedAt, int count) { }
}