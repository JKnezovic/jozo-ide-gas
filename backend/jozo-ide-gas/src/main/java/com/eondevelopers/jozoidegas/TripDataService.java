package com.eondevelopers.jozoidegas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;

@Service
public class TripDataService {

    public static final String STATUS_ONGOING = "ongoing";
    public static final String STATUS_DONE = "done";

    @Autowired
    private TripDataRepository tripDataRepository;

    public List<TripData> allTrips(){
        return tripDataRepository.findAll();
    }

    public Optional<List<TripData>> singleTrip(String status){
        return tripDataRepository.findTripByStatus(status);
    }

    public TripData create(TripRequest request) {
        String tripId = trimmed(request.getTripId());
        String tripName = trimmed(request.getTripName());
        if (tripId == null || tripName == null) {
            throw new IllegalArgumentException("tripName and tripId are both required");
        }
        if (tripDataRepository.findByTripId(tripId).isPresent()) {
            throw new IllegalStateException("A trip with id '" + tripId + "' already exists");
        }

        String status = normalisedStatus(request.getStatus(), STATUS_ONGOING);
        if (STATUS_ONGOING.equals(status)) {
            rejectSecondOngoingTrip(tripId);
        }

        TripData trip = new TripData();
        trip.setTripId(tripId);
        trip.setTripName(tripName);
        trip.setStatus(status);
        trip.setTotalLength(request.getTotalLength() == null ? 0 : request.getTotalLength());
        trip.setDays(request.getDays() == null ? 0 : request.getDays());
        trip.setDescription(request.getDescription());
        trip.setImageSource(request.getImageSource());
        trip.setDate(request.getDate());
        trip.setRideIds(new ArrayList<>());

        return tripDataRepository.save(trip);
    }

    /** Applies only the fields the request actually carried. tripId is fixed once created. */
    public TripData update(String tripId, TripRequest request) {
        TripData existing = tripDataRepository.findByTripId(tripId)
                .orElseThrow(() -> new NoSuchElementException("No trip with id '" + tripId + "'"));

        if (request.getStatus() != null) {
            String status = normalisedStatus(request.getStatus(), null);
            if (STATUS_ONGOING.equals(status)) {
                rejectSecondOngoingTrip(tripId);
            }
            existing.setStatus(status);
        }
        if (request.getTripName() != null) {
            existing.setTripName(request.getTripName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getImageSource() != null) {
            existing.setImageSource(request.getImageSource());
        }
        if (request.getDate() != null) {
            existing.setDate(request.getDate());
        }
        if (request.getTotalLength() != null) {
            existing.setTotalLength(request.getTotalLength());
        }
        if (request.getDays() != null) {
            existing.setDays(request.getDays());
        }

        // Rides deleted before the reference cleanup landed resolve to nulls; writing those
        // back would keep the rot alive, so drop them while we are saving anyway.
        if (existing.getRideIds() != null) {
            existing.getRideIds().removeIf(Objects::isNull);
        }

        return tripDataRepository.save(existing);
    }

    /**
     * The website renders the first ongoing trip it receives, so a second one would quietly
     * become invisible. Better to refuse than to hide a trip.
     */
    private void rejectSecondOngoingTrip(String tripIdBeingSaved) {
        List<TripData> ongoing = tripDataRepository.findTripByStatus(STATUS_ONGOING).orElse(List.of());
        boolean anotherIsOngoing = ongoing.stream()
                .anyMatch(trip -> !Objects.equals(trip.getTripId(), tripIdBeingSaved));
        if (anotherIsOngoing) {
            String name = ongoing.get(0).getTripName();
            throw new IllegalStateException(
                    "'" + name + "' is still ongoing - mark it done before starting another trip");
        }
    }

    private String normalisedStatus(String status, String fallback) {
        if (status == null || status.isBlank()) {
            if (fallback == null) {
                throw new IllegalArgumentException("status cannot be blank");
            }
            return fallback;
        }
        String normalised = status.trim().toLowerCase();
        if (!STATUS_ONGOING.equals(normalised) && !STATUS_DONE.equals(normalised)) {
            throw new IllegalArgumentException(
                    "status must be '" + STATUS_ONGOING + "' or '" + STATUS_DONE + "'");
        }
        return normalised;
    }

    private String trimmed(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
