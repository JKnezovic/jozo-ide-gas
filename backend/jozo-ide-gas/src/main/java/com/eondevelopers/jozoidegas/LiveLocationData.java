package com.eondevelopers.jozoidegas;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "LiveLocation")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LiveLocationData {
    @Id
    private ObjectId id;
    private Date updatedAt;
    private double[] latLng;
}
