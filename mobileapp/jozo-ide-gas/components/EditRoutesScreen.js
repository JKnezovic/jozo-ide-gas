import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/axiosConfig";
import { describeError } from "../api/errors";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-CA");
};

export default function EditRoutesScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/trips");
      const loaded = response.data ?? [];
      setTrips(loaded);
      setSelectedTripId((current) => {
        if (current && loaded.some((trip) => trip.tripId === current)) {
          return current;
        }
        // Default to the trip being ridden right now, which is the usual thing to edit.
        const ongoing = loaded.find((trip) => trip.status === "ongoing");
        return (ongoing ?? loaded[0])?.tripId ?? null;
      });
    } catch (error) {
      Alert.alert("Could not load trips", describeError(error, "Check your connection and try again."));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips])
  );

  const selectedTrip = trips.find((trip) => trip.tripId === selectedTripId);
  // Rides deleted before the reference cleanup can still resolve to null here.
  const rides = (selectedTrip?.rideIds ?? []).filter(Boolean);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripBar}>
        {trips.map((trip) => (
          <TouchableOpacity
            key={trip.tripId}
            style={[styles.tripChip, trip.tripId === selectedTripId ? styles.tripChipActive : null]}
            onPress={() => setSelectedTripId(trip.tripId)}
          >
            <Text style={styles.tripChipText}>{trip.tripName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView>
        {rides.length === 0 ? (
          <Text style={styles.empty}>This trip has no routes yet.</Text>
        ) : (
          rides
            .slice()
            .reverse()
            .map((ride) => (
              <TouchableOpacity
                key={ride.id}
                style={styles.row}
                onPress={() => navigation.navigate("EditRoute", { ride })}
              >
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.routeName}>{ride.routeName}</Text>
                  <Text style={styles.meta}>
                    {`${formatDate(ride.date)}  -  ${ride.length ?? 0} km  -  ${
                      (ride.images ?? []).length
                    } media`}
                  </Text>
                </View>
                <Text style={styles.chevron}>{"\u203A"}</Text>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tripBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 10 },
  tripChip: {
    backgroundColor: "#dddddd",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
  },
  tripChipActive: { backgroundColor: "#efb30d" },
  tripChipText: { fontWeight: "600" },
  empty: { textAlign: "center", color: "gray", marginTop: 40 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  routeName: { fontSize: 17, fontWeight: "600" },
  meta: { color: "gray", marginTop: 4 },
  chevron: { fontSize: 28, color: "#bbb", marginLeft: 10 },
});
