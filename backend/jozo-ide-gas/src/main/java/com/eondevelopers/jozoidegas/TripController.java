package com.eondevelopers.jozoidegas;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
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

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripRequest request) {
        try {
            return new ResponseEntity<>(tripDataService.create(request), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable String tripId, @RequestBody TripRequest request) {
        try {
            return ResponseEntity.ok(tripDataService.update(tripId, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
