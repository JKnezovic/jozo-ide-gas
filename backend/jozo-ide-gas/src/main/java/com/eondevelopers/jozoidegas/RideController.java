package com.eondevelopers.jozoidegas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/rides")
public class RideController {
    @Autowired
    private RideService rideService;

    @PostMapping
    public ResponseEntity<Ride> createTrip(@RequestParam("file") MultipartFile file,
                                           @RequestParam("routeName") String routeName,
                                           @RequestParam("tripId") String tripId){
        return new ResponseEntity<Ride>(rideService.createRide(routeName,tripId,file), HttpStatus.CREATED);
    }
}
