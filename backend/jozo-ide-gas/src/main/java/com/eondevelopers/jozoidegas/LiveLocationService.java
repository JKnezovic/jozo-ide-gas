package com.eondevelopers.jozoidegas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;


@Service
public class LiveLocationService {

    @Autowired
    private LiveLocationRepository liveLocationRepository;
    public List<LiveLocationData> allLocations(){
        return liveLocationRepository.findAll() ;
    }

    public Optional<LiveLocationData> getLocationById(String id) {
        return liveLocationRepository.findById(id);
    }

    public ResponseEntity<String> updateLiveLocation(String id, LiveLocationData liveLocationData){
        try {
            LiveLocationData existingLiveLocation = liveLocationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Location not found for id: " + id));

            // Update the fields
            existingLiveLocation.setLatLng(liveLocationData.getLatLng());
            existingLiveLocation.setUpdatedAt(new Date());

            // Save the updated location
            liveLocationRepository.save(existingLiveLocation);

            return ResponseEntity.ok("Location updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating location: " + e.getMessage());
        }
    }
}
