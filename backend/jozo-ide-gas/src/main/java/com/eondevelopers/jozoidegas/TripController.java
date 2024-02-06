package com.eondevelopers.jozoidegas;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {
    @Autowired
    private TripDataService tripDataService;
    @GetMapping
    public ResponseEntity<List<TripData>> getAllTrips(){
        return new ResponseEntity<List<TripData>>(tripDataService.allTrips(), HttpStatus.OK);
    }

    @GetMapping(value = "/{status}")
    public ResponseEntity<Optional<List<TripData>>> getSingleTrip(@PathVariable String status){
        return new ResponseEntity<Optional<List<TripData>>>(tripDataService.singleTrip(status),HttpStatus.OK);
    }


}
