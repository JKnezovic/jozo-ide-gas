package com.eondevelopers.jozoidegas;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.http.HttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class ApiKeyFilterTest {

    private static final String KEY = "correct-horse-battery-staple";

    private MockHttpServletResponse run(String method, String uri, String header, String configuredKey)
            throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter();
        ReflectionTestUtils.setField(filter, "apiKey", configuredKey);

        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        if (header != null) {
            request.addHeader("X-Api-Key", header);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    @Test
    void readsPassWithoutAKey() throws Exception {
        assertEquals(HttpServletResponse.SC_OK, run("GET", "/api/v1/trips", null, KEY).getStatus());
    }

    @Test
    void preflightPassesWithoutAKey() throws Exception {
        assertEquals(HttpServletResponse.SC_OK, run("OPTIONS", "/api/v1/rides", null, KEY).getStatus());
    }

    @Test
    void writeWithoutAKeyIsRejected() throws Exception {
        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, run("POST", "/api/v1/rides", null, KEY).getStatus());
    }

    @Test
    void writeWithWrongKeyIsRejected() throws Exception {
        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, run("DELETE", "/api/v1/rides/1", "nope", KEY).getStatus());
    }

    @Test
    void writeWithCorrectKeyPasses() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/rides", KEY, KEY);
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
        assertNull(response.getErrorMessage());
    }

    @Test
    void liveLocationUpdateIsGuarded() throws Exception {
        assertEquals(HttpServletResponse.SC_UNAUTHORIZED,
                run("PUT", "/api/v1/live-location/updateLocation", null, KEY).getStatus());
    }

    @Test
    void unconfiguredServerFailsClosed() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/rides", KEY, "");
        assertEquals(HttpServletResponse.SC_SERVICE_UNAVAILABLE, response.getStatus());
        assertNotNull(response.getErrorMessage());
    }
}
