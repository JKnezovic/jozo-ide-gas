package com.eondevelopers.jozoidegas;

import lombok.Data;

import java.util.List;

/**
 * JSON payload for editing a ride. Every field is optional - null means "leave it alone".
 *
 * This is JSON rather than multipart on purpose: Tomcat only parses form fields out of a
 * multipart body for POST, so the same form-encoded shape the create endpoint uses would
 * silently arrive empty on a PUT. Replacing the GPX track has its own POST endpoint.
 */
@Data
public class RideUpdateRequest {
    private String routeName;
    private Integer length;
    /** yyyy-MM-dd, parsed in the server's timezone to match the create endpoint. */
    private String date;
    private List<String> statuses;
    /** Lines up with the ride's stored media by position. */
    private List<String> mediaDescriptions;
    /** "latitude, longitude" - replaces the track with a single point, as a rest day has. */
    private String location;
}
