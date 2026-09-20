package com.eondevelopers.jozoidegas;


import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class RideService {
    @Autowired
    private RideRepository rideRepository;
    @Autowired
    private MongoTemplate mongoTemplate;
    @Autowired
    private AmazonS3Service amazonS3Service;

    /**
     * Removes the ride and the trip's reference to it. Dropping only the ride document would
     * leave a dangling @DocumentReference behind in TripData.rideIds. The trip's totalLength
     * is deliberately untouched - it is the planned distance, not the sum of the rides.
     */
    public void deleteRideById(String id) {
        Ride ride = getRideById(id);
        if (ride != null) {
            mongoTemplate.update(TripData.class)
                    .matching(Criteria.where("tripId").is(ride.getTripId()))
                    .apply(new Update().pull("rideIds", new ObjectId(id)))
                    .first();
        }
        rideRepository.deleteById(id);
    }
    public Ride createRide(String routeName, String tripId, MultipartFile file, int length, Date date, List<String> statuses, MultipartFile[] images,  List<String> imageDescriptions, String location){
        List<Trkpt> positions = new ArrayList<>();
        if(file!=null){
            String gpxString = readGpxFile(file);
            GpxData gpxData = GpxParser.parseGpx(gpxString);
            positions = gpxData.getTrackPoints();
        }
        else{
            String[] parts = location.split(",");
            double lat = Double.parseDouble(parts[0].trim());
            double lon = Double.parseDouble(parts[1].trim());
            Trkpt trkpt = new Trkpt();
            trkpt.setLat(lat);
            trkpt.setLon(lon);
            positions.add(trkpt);
        }

        List<Image> uploadedImages = new ArrayList<>();
        if(images != null) {
           uploadedImages = uploadPhotos(images, imageDescriptions);
        }
        Ride ride = rideRepository.insert(new Ride(routeName,tripId,positions,length,date, statuses, uploadedImages));

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
            e.printStackTrace();
            return "Error reading GPX file";
        }
    }

    private List<Image> uploadPhotos(MultipartFile[] files, List<String> descriptions) {
        List<Image> uploadedPhotos = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String description = (descriptions != null && i < descriptions.size()) ? descriptions.get(i) : "";

            try {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                Thumbnails.of(file.getInputStream())
                        .size(200, 200)
                        .outputQuality(1.0)
                        .outputFormat("jpg")
                        .toOutputStream(outputStream);

                byte[] thumbnailBytes = outputStream.toByteArray();

                String originalName = file.getOriginalFilename();
                String thumbnailName = (originalName == null ? "thumbnail" : originalName.replaceAll("\\.[^.]*$", "")) + ".jpg";

                MultipartFile thumbnailFile = new ByteArrayMultipartFile(
                        thumbnailBytes,
                        thumbnailName,
                        thumbnailName,
                        "image/jpeg"
                );

                String thumbnailUrl = amazonS3Service.uploadFile(thumbnailFile, "ImagesLQ");

                String imageUrl = amazonS3Service.uploadFile(file, "ImagesHQ");

                Image photo = new Image(imageUrl,thumbnailUrl, description);

                uploadedPhotos.add(photo);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return uploadedPhotos;
    }

    public Ride getRideById(String id) {
        return rideRepository.findById(id).orElse(null);
    }
}
