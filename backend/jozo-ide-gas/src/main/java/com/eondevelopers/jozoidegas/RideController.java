package com.eondevelopers.jozoidegas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rides")
public class RideController {
    @Autowired
    private RideService rideService;
    @Autowired
    private AmazonS3Service amazonS3Service;
    @PostMapping
    public ResponseEntity<Ride> createTrip(@RequestParam(value = "file", required = false) MultipartFile file,
                                           @RequestParam("routeName") String routeName,
                                           @RequestParam("tripId") String tripId,
                                           @RequestParam("length") int length,
                                           @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd")  Date date,
                                           @RequestParam(value="images", required = false) MultipartFile[] images,
                                           @RequestParam(value = "location", required = false) String location,
                                           HttpServletRequest request){
        if (file == null && (location == null || location.isBlank())) {
            return ResponseEntity.badRequest().build();
        }
        try {
        List<String> statuses = multiValueParam(request, "statuses");
        List<String> imageDescriptions = multiValueParam(request, "imageDescriptions");
        return new ResponseEntity<Ride>(rideService.createRide(routeName,tripId,file,length,date,statuses,images,imageDescriptions, location), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reads a repeated form field verbatim. Binding these through @RequestParam List<String>
     * is unsafe: when the field is sent exactly once Spring hands the converter a single
     * String and it splits that value on commas, so any status or description containing a
     * comma gets chopped and every later entry shifts onto the wrong image.
     */
    private List<String> multiValueParam(HttpServletRequest request, String name) {
        String[] values = request.getParameterValues(name);
        return values == null ? new ArrayList<>() : Arrays.asList(values);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRide(@PathVariable String id) {
        try {
            Ride ride = rideService.getRideById(id);
            if (ride == null) {
                return ResponseEntity.notFound().build();
            }
            List<Image> images = ride.getImages() == null ? List.of() : ride.getImages();

            for (Image image : images) {
                amazonS3Service.deleteImageFromS3(image.getSrc());
                amazonS3Service.deleteImageFromS3(image.getLQIPsrc());
            }
            rideService.deleteRideById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
