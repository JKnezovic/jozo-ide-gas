package com.eondevelopers.jozoidegas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/live-location")
public class LiveLocationController {

    @Autowired
    private LiveLocationService liveLocationService;
    @GetMapping
    public ResponseEntity<Optional<LiveLocationData>> getLiveLocation(){
        return new ResponseEntity<Optional<LiveLocationData>>(liveLocationService.getLocationById("65c27e2d25ff35824afa8ad2"), HttpStatus.OK);
    }
    @PutMapping("/updateLocation")
    public ResponseEntity<String> updateLocation(@RequestBody LiveLocationData liveLocationData ) {
        return liveLocationService.updateLiveLocation("65c27e2d25ff35824afa8ad2",liveLocationData);
    }
}
