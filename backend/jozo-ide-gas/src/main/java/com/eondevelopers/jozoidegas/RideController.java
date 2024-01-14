package com.eondevelopers.jozoidegas;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/rides")
public class RideController {
    @Autowired
    private RideService rideService;

    @PostMapping
    public ResponseEntity<Ride> createTrip(@RequestBody Map<String,String> payload){
        return new ResponseEntity<Ride>(rideService.createRide(payload.get("routeName"),payload.get("tripId")), HttpStatus.CREATED);
    }
}
