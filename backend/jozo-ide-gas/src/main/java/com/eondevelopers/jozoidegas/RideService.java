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

import java.text.ParseException;
import java.text.SimpleDateFormat;

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
        List<Trkpt> positions = file != null ? positionsFromGpx(file) : positionsFromLocation(location);

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

    /**
     * Applies the fields the caller actually sent. Media is left alone apart from its
     * descriptions - adding or removing photos is what create and delete are for.
     */
    public Ride updateRide(String id, RideUpdateRequest request) {
        Ride ride = getRideById(id);
        if (ride == null) {
            return null;
        }

        if (request.getRouteName() != null && !request.getRouteName().isBlank()) {
            ride.setRouteName(request.getRouteName());
        }
        if (request.getLength() != null) {
            ride.setLength(request.getLength());
        }
        if (request.getDate() != null && !request.getDate().isBlank()) {
            ride.setDate(parseDate(request.getDate()));
        }
        if (request.getStatuses() != null) {
            ride.setStatuses(request.getStatuses());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            ride.setPositions(positionsFromLocation(request.getLocation()));
        }
        if (request.getMediaDescriptions() != null) {
            applyDescriptions(ride, request.getMediaDescriptions());
        }

        return rideRepository.save(ride);
    }

    /** Swaps in a new GPX track, leaving everything else about the ride untouched. */
    public Ride replaceTrack(String id, MultipartFile file) {
        Ride ride = getRideById(id);
        if (ride == null) {
            return null;
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A GPX file is required");
        }
        ride.setPositions(positionsFromGpx(file));
        return rideRepository.save(ride);
    }

    /**
     * Parsed with the server's timezone rather than Jackson's UTC default, so an edited
     * date lands on the same day the create endpoint would have stored.
     */
    private Date parseDate(String date) {
        try {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            format.setLenient(false);
            return format.parse(date.trim());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Date must look like yyyy-MM-dd");
        }
    }

    /** Descriptions line up with the stored media by position; extras are ignored. */
    private void applyDescriptions(Ride ride, List<String> descriptions) {
        List<Image> media = ride.getImages();
        if (media == null) {
            return;
        }
        for (int i = 0; i < media.size() && i < descriptions.size(); i++) {
            media.get(i).setDesc(descriptions.get(i));
        }
    }

    private List<Trkpt> positionsFromGpx(MultipartFile file) {
        String gpxString = readGpxFile(file);
        GpxData gpxData = GpxParser.parseGpx(gpxString);
        List<Trkpt> trackPoints = gpxData == null ? null : gpxData.getTrackPoints();
        if (trackPoints == null || trackPoints.isEmpty()) {
            throw new IllegalArgumentException("No track points could be read from that GPX file");
        }
        return trackPoints;
    }

    /** A rest day has no track, just the single point the day was spent at. */
    private List<Trkpt> positionsFromLocation(String location) {
        if (location == null || location.isBlank()) {
            throw new IllegalArgumentException("A GPX file or a location is required");
        }
        String[] parts = location.split(",");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Location must look like 'latitude, longitude'");
        }
        try {
            Trkpt trkpt = new Trkpt();
            trkpt.setLat(Double.parseDouble(parts[0].trim()));
            trkpt.setLon(Double.parseDouble(parts[1].trim()));
            List<Trkpt> positions = new ArrayList<>();
            positions.add(trkpt);
            return positions;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Location must be two numbers, like '45.815, 15.982'");
        }
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
