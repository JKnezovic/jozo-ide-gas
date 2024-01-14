package com.eondevelopers.jozoidegas;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TripDataService {
    @Autowired
    private TripDataRepository tripDataRepository;
    public List<TripData> allTrips(){
        return tripDataRepository.findAll();
    }

    public Optional<List<TripData>> singleTrip(String status){
        return tripDataRepository.findTripByStatus(status);
    }
}
