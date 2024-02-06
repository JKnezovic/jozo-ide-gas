package com.eondevelopers.jozoidegas;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LiveLocationRepository extends MongoRepository<LiveLocationData, String> {

}
