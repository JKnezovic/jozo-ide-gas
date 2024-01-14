package com.eondevelopers.jozoidegas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    @Id
    private ObjectId id;
    private String routeName;
    private String tripId;

    public Ride(String routeName, String tripId) {
        this.routeName = routeName;
        this.tripId = tripId;
    }
}
