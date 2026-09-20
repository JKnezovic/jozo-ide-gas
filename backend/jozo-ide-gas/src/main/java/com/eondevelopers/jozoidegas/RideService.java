package com.eondevelopers.jozoidegas;


import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(RideService.class);

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
           uploadedImages = uploadMedia(images, imageDescriptions);
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

    private List<Image> uploadMedia(MultipartFile[] files, List<String> descriptions) {
        List<Image> uploadedMedia = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String description = (descriptions != null && i < descriptions.size()) ? descriptions.get(i) : "";

            try {
                uploadedMedia.add(isVideo(file) ? uploadVideo(file, description) : uploadPhoto(file, description));
            } catch (Exception e) {
                log.error("Could not attach {} to the ride", file.getOriginalFilename(), e);
            }
        }

        uploadedMedia.removeIf(java.util.Objects::isNull);
        return uploadedMedia;
    }

    private boolean isVideo(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith("video/");
    }

    /**
     * Videos are stored as-is. Producing a poster frame would mean running ffmpeg on the
     * server, so the site renders the first frame from the video element instead and this
     * leaves LQIPsrc null.
     */
    private Image uploadVideo(MultipartFile file, String description) {
        String videoUrl = amazonS3Service.uploadFile(file, "VideosHQ");
        if (videoUrl == null) {
            log.error("Upload failed for video {} - leaving it off the ride", file.getOriginalFilename());
            return null;
        }
        return new Image(videoUrl, null, description, Image.TYPE_VIDEO);
    }

    private Image uploadPhoto(MultipartFile file, String description) {
        String imageUrl = amazonS3Service.uploadFile(file, "ImagesHQ");
        if (imageUrl == null) {
            log.error("Upload failed for photo {} - leaving it off the ride", file.getOriginalFilename());
            return null;
        }

        // A thumbnail that cannot be generated costs page-load speed, not the photo:
        // fall back to the full image rather than dropping the photo silently.
        String thumbnailUrl = uploadThumbnail(file);
        if (thumbnailUrl == null) {
            log.warn("No thumbnail for photo {} - falling back to the full image", file.getOriginalFilename());
            thumbnailUrl = imageUrl;
        }

        return new Image(imageUrl, thumbnailUrl, description, Image.TYPE_IMAGE);
    }

    /** Returns the uploaded thumbnail url, or null if one could not be produced. */
    private String uploadThumbnail(MultipartFile file) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .size(200, 200)
                    .outputQuality(1.0)
                    .outputFormat("jpg")
                    .toOutputStream(outputStream);

            String originalName = file.getOriginalFilename();
            String thumbnailName = (originalName == null ? "thumbnail" : originalName.replaceAll("\\.[^.]*$", "")) + ".jpg";

            MultipartFile thumbnailFile = new ByteArrayMultipartFile(
                    outputStream.toByteArray(),
                    thumbnailName,
                    thumbnailName,
                    "image/jpeg");

            return amazonS3Service.uploadFile(thumbnailFile, "ImagesLQ");
        } catch (Exception e) {
            log.warn("Thumbnail generation failed for {}", file.getOriginalFilename(), e);
            return null;
        }
    }

    public Ride getRideById(String id) {
        return rideRepository.findById(id).orElse(null);
    }
}
