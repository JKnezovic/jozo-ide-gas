import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/axiosConfig";
import { Feather } from "@expo/vector-icons";

export default function DeleteRequestScreen() {
  const [rideIds, setRideIds] = useState([]);
  useEffect(() => {
    const fetchOngoingTrips = async () => {
      try {
        const response = await api.get("/api/v1/trips/ongoing");
        setRideIds(response.data[0].rideIds);
      } catch (error) {
        console.error("Error fetching ongoing trips:", error);
      }
    };
    fetchOngoingTrips();
  }, []);

  const handleDelete = async (id, routeName) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${routeName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await api.delete(`/api/v1/rides/${id}`);
              if (response.status === 204) {
                console.log("Ride deleted successfully");
                setRideIds(rideIds.filter((ride) => ride.id !== id));
              } else {
                console.error("Failed to delete ride");
              }
            } catch (error) {
              console.error("Error deleting ride:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {rideIds.map((ride, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.routeName}>{ride.routeName}</Text>
            <TouchableOpacity onPress={() => handleDelete(ride.id, ride.routeName)}>
              <Feather name="x" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  routeName: {
    fontSize: 18,
    marginRight: 10,
  },
});
