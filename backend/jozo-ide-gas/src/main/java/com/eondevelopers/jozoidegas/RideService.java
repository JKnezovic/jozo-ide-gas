package com.eondevelopers.jozoidegas;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

@Service
public class RideService {
    @Autowired
    private RideRepository rideRepository;
    @Autowired
    private MongoTemplate mongoTemplate;
    public Ride createRide(String routeName, String tripId, MultipartFile file){
        System.out.println("Received file: " + file.getOriginalFilename());
        String gpxString = readGpxFile(file);
        GpxData gpxData = GpxParser.parseGpx(gpxString);
        List<Trkpt> positions = gpxData.getTrackPoints();
        Ride ride = rideRepository.insert(new Ride(routeName,tripId,positions));

        System.out.println("Bila vidila: ");
        mongoTemplate.update(TripData.class)
                .matching(Criteria.where("tripId").is(tripId))
                .apply(new Update().push("rideIds").value(ride))
                .first();

        return ride;
    }

    private String readGpxFile(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
            return content.toString();
        } catch (IOException e) {
            // Handle exception (e.g., file not found, unable to read)
            e.printStackTrace();
            return "Error reading GPX file";
        }
    }
}
