import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/axiosConfig";
import { describeError } from "../api/errors";

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [busy, setBusy] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/trips");
      setTrips(response.data ?? []);
    } catch (error) {
      Alert.alert("Could not load trips", describeError(error, "Check your connection and try again."));
    }
  }, []);

  // Refetch on focus so returning from the form shows the saved values.
  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips])
  );

  const changeStatus = (trip, status) => {
    const verb = status === "done" ? "Mark as done" : "Make ongoing";
    Alert.alert(verb, `${verb} for ${trip.tripName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: verb,
        onPress: async () => {
          setBusy(true);
          try {
            await api.put(`/api/v1/trips/${trip.tripId}`, { status });
            await fetchTrips();
          } catch (error) {
            // A 409 here means another trip is still ongoing - the message says which.
            Alert.alert("Could not change status", describeError(error, "The update was rejected."));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {trips.length === 0 ? (
          <Text style={styles.empty}>No trips yet. Create the first one below.</Text>
        ) : null}

        {trips.map((trip) => {
          const isOngoing = trip.status === "ongoing";
          return (
            <View key={trip.tripId} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.tripName}>{trip.tripName}</Text>
                <Text style={[styles.badge, isOngoing ? styles.badgeOngoing : styles.badgeDone]}>
                  {(trip.status ?? "unknown").toUpperCase()}
                </Text>
              </View>
              <Text style={styles.meta}>
                {`${trip.tripId}  -  ${trip.totalLength ?? 0} km  -  ${trip.days ?? 0} days  -  ${
                  trip.rideIds?.length ?? 0
                } routes`}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("TripForm", { trip })}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={busy}
                  style={[styles.actionButton, busy ? styles.disabled : null]}
                  onPress={() => changeStatus(trip, isOngoing ? "done" : "ongoing")}
                >
                  <Text style={styles.actionText}>{isOngoing ? "Mark done" : "Make ongoing"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate("TripForm", {})}>
        <Text style={styles.newButtonText}>New Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: "gray", marginTop: 40 },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tripName: { fontSize: 18, fontWeight: "600", flexShrink: 1 },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeOngoing: { backgroundColor: "#efb30d", color: "#000" },
  badgeDone: { backgroundColor: "#dddddd", color: "#555" },
  meta: { color: "gray", marginTop: 6 },
  actions: { flexDirection: "row", marginTop: 12 },
  actionButton: {
    backgroundColor: "#efb30d",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  actionText: { fontWeight: "600" },
  disabled: { opacity: 0.5 },
  newButton: {
    backgroundColor: "#3a3347",
    paddingVertical: 14,
    alignItems: "center",
  },
  newButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
