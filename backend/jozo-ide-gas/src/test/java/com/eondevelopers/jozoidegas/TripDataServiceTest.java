package com.eondevelopers.jozoidegas;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TripDataServiceTest {

    @Mock
    private TripDataRepository repository;

    @InjectMocks
    private TripDataService service;

    private TripRequest request(String name, String id, String status) {
        TripRequest request = new TripRequest();
        request.setTripName(name);
        request.setTripId(id);
        request.setStatus(status);
        return request;
    }

    private TripData trip(String id, String name, String status) {
        TripData trip = new TripData();
        trip.setTripId(id);
        trip.setTripName(name);
        trip.setStatus(status);
        return trip;
    }

    private void noExistingTrips() {
        when(repository.findByTripId(any())).thenReturn(Optional.empty());
        when(repository.findTripByStatus(any())).thenReturn(Optional.of(List.of()));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));
    }

    // --- create ------------------------------------------------------------

    @Test
    void createDefaultsToOngoingWithAnEmptyRideList() {
        noExistingTrips();

        TripData created = service.create(request("Nordkapp", "nordkapp", null));

        assertEquals("ongoing", created.getStatus());
        assertEquals(0, created.getTotalLength());
        assertTrue(created.getRideIds().isEmpty());
    }

    @Test
    void createRequiresNameAndId() {
        assertThrows(IllegalArgumentException.class, () -> service.create(request(null, "nordkapp", null)));
        assertThrows(IllegalArgumentException.class, () -> service.create(request("Nordkapp", "  ", null)));
        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsADuplicateTripId() {
        when(repository.findByTripId("nordkapp")).thenReturn(Optional.of(trip("nordkapp", "Nordkapp", "done")));

        assertThrows(IllegalStateException.class, () -> service.create(request("Another", "nordkapp", null)));
        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsASecondOngoingTrip() {
        when(repository.findByTripId(any())).thenReturn(Optional.empty());
        when(repository.findTripByStatus("ongoing"))
                .thenReturn(Optional.of(List.of(trip("nordkapp", "Nordkapp", "ongoing"))));

        IllegalStateException thrown = assertThrows(IllegalStateException.class,
                () -> service.create(request("Alps", "alps", "ongoing")));
        assertTrue(thrown.getMessage().contains("Nordkapp"));
    }

    @Test
    void aDoneTripCanBeCreatedWhileAnotherIsOngoing() {
        when(repository.findByTripId(any())).thenReturn(Optional.empty());
        when(repository.findTripByStatus("ongoing"))
                .thenReturn(Optional.of(List.of(trip("nordkapp", "Nordkapp", "ongoing"))));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        assertEquals("done", service.create(request("Alps 2019", "alps-2019", "done")).getStatus());
    }

    @Test
    void createRejectsAnUnknownStatus() {
        when(repository.findByTripId(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.create(request("Alps", "alps", "planned")));
    }

    // --- update ------------------------------------------------------------

    @Test
    void updateMovesAnOngoingTripToDone() {
        TripData existing = trip("nordkapp", "Nordkapp", "ongoing");
        when(repository.findByTripId("nordkapp")).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        TripRequest update = new TripRequest();
        update.setStatus("Done");   // case and spacing should not matter

        assertEquals("done", service.update("nordkapp", update).getStatus());
    }

    @Test
    void updateOnlyTouchesFieldsThatWereSent() {
        TripData existing = trip("nordkapp", "Nordkapp", "ongoing");
        existing.setDescription("original description");
        existing.setTotalLength(4200);
        when(repository.findByTripId("nordkapp")).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        TripRequest update = new TripRequest();
        update.setDays(64);

        TripData saved = service.update("nordkapp", update);
        assertEquals(64, saved.getDays());
        assertEquals("original description", saved.getDescription());
        assertEquals(4200, saved.getTotalLength());
        assertEquals("ongoing", saved.getStatus());
    }

    @Test
    void aTripCanBeSavedAsOngoingWhenItIsTheOngoingOne() {
        TripData existing = trip("nordkapp", "Nordkapp", "ongoing");
        when(repository.findByTripId("nordkapp")).thenReturn(Optional.of(existing));
        when(repository.findTripByStatus("ongoing")).thenReturn(Optional.of(List.of(existing)));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        TripRequest update = new TripRequest();
        update.setStatus("ongoing");

        assertEquals("ongoing", service.update("nordkapp", update).getStatus());
    }

    @Test
    void updateRejectsMakingASecondTripOngoing() {
        when(repository.findByTripId("alps")).thenReturn(Optional.of(trip("alps", "Alps", "done")));
        when(repository.findTripByStatus("ongoing"))
                .thenReturn(Optional.of(List.of(trip("nordkapp", "Nordkapp", "ongoing"))));

        TripRequest update = new TripRequest();
        update.setStatus("ongoing");

        assertThrows(IllegalStateException.class, () -> service.update("alps", update));
        verify(repository, never()).save(any());
    }

    @Test
    void updateRejectsAnUnknownTrip() {
        when(repository.findByTripId("ghost")).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.update("ghost", new TripRequest()));
    }

    @Test
    void updateDropsRideReferencesThatNoLongerResolve() {
        TripData existing = trip("nordkapp", "Nordkapp", "ongoing");
        existing.setRideIds(new ArrayList<>(Arrays.asList(new Ride(), null, new Ride())));
        when(repository.findByTripId("nordkapp")).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        TripRequest update = new TripRequest();
        update.setDays(10);

        assertEquals(2, service.update("nordkapp", update).getRideIds().size());
    }
}
