package com.eondevelopers.jozoidegas;

import lombok.Data;

/**
 * Create/update payload for a trip. Deliberately not TripData itself: binding straight onto
 * the document would let a request blank out rideIds, and boxed numbers are what make a
 * partial update expressible - null means "leave this field alone", which a primitive int
 * cannot say.
 */
@Data
public class TripRequest {
    private String tripName;
    private String tripId;
    private Integer totalLength;
    private String status;
    private String description;
    private String imageSource;
    private String date;
    private Integer days;
}
