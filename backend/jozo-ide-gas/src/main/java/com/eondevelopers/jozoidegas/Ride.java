package com.eondevelopers.jozoidegas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    @Id
    private ObjectId id;
    private String routeName;
    private String tripId;
    private List<Trkpt> positions;
    private int length;
    private Date date;
    private List<String> statuses;
    private List<Image> images;

    public Ride(String routeName, String tripId, List<Trkpt> positions, int length, Date date, List<String> statuses, List<Image> images) {
        this.routeName = routeName;
        this.tripId = tripId;
        this.positions = positions;
        this.length = length;
        this.date = date;
        this.statuses = statuses;
        this.images = images;
    }
}
