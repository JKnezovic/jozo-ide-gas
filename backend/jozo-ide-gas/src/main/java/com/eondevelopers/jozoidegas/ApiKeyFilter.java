package com.eondevelopers.jozoidegas;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Set;

/**
 * Guards every state-changing call with a shared secret sent as an X-Api-Key header.
 * Reads stay open so the public website keeps working without a key of its own.
 */
@Component
@Order(1)
public class    ApiKeyFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyFilter.class);
    private static final String HEADER = "X-Api-Key";
    private static final Set<String> WRITE_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    @Value("${API_KEY:}")
    private String apiKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !WRITE_METHODS.contains(request.getMethod().toUpperCase());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // Fail closed: an unset key must never mean "let everything through".
        if (apiKey == null || apiKey.isBlank()) {
            log.error("API_KEY is not configured - refusing {} {}", request.getMethod(), request.getRequestURI());
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "Server is missing its API key configuration");
            return;
        }

        if (!matches(request.getHeader(HEADER))) {
            log.warn("Rejected {} {} from {}: missing or invalid API key",
                    request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid API key");
            return;
        }

        chain.doFilter(request, response);
    }

    /** Constant-time comparison so a wrong key cannot be narrowed down by timing. */
    private boolean matches(String presented) {
        if (presented == null) {
            return false;
        }
        return MessageDigest.isEqual(
                presented.getBytes(StandardCharsets.UTF_8),
                apiKey.getBytes(StandardCharsets.UTF_8));
    }
}
