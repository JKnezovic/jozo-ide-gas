package com.eondevelopers.jozoidegas;


import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
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
            String description = descriptions.get(i);

            try {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                Thumbnails.of(file.getInputStream())
                        .size(200, 200)
                        .outputQuality(1.0)
                        .outputFormat("jpg")
                        .toOutputStream(outputStream);

                byte[] thumbnailBytes = outputStream.toByteArray();

                MultipartFile thumbnailFile = new ByteArrayMultipartFile(
                        thumbnailBytes,
                        file.getOriginalFilename(),
                        file.getOriginalFilename(),
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
}
