package com.eondevelopers.jozoidegas;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.util.List;

@Document(collection = "TripData")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TripData {
    @Id
    private ObjectId id;
    private String tripName;
    private int totalLength;
    @DocumentReference
    private List<Ride> rideIds;
    private String status;
    private String description;
    private String imageSource;
    private String date;
    private int days;
    private String tripId;
}
