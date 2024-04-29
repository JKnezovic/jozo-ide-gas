package com.eondevelopers.jozoidegas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
                                           @RequestParam("statuses") List<String> statuses,
                                           @RequestParam(value="images", required = false) MultipartFile[] images,
                                           @RequestParam(value="imageDescriptions", required = false) List<String> imageDescriptions,
                                           @RequestParam(value = "location", required = false) String location){
        try {
        return new ResponseEntity<Ride>(rideService.createRide(routeName,tripId,file,length,date,statuses,images,imageDescriptions, location), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRide(@PathVariable String id) {
        try {
            Ride ride = rideService.getRideById(id);
            List<Image> images = ride.getImages();

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
