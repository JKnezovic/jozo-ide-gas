package com.eondevelopers.jozoidegas;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TripDataRepository extends MongoRepository<TripData, ObjectId> {
    Optional<List<TripData>> findTripByStatus(String status);
}
