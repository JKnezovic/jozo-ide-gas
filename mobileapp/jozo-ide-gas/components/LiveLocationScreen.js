import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import api from "../api/axiosConfig";
import * as TaskManager from "expo-task-manager";

const LOCATION_TRACKING = "location-tracking";

const sendLocationData = (latitude, longitude) => {
  api
    .put("/api/v1/live-location/updateLocation", {
      latLng: [latitude, longitude],
    })
    .then((response) => {
      console.log("Location data sent successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error sending location data:", error);
    });
};

function UserLocation() {
  const [locationStarted, setLocationStarted] = useState(false);
  const [intervalDuration, setIntervalDuration] = useState(15);
  const intervalValues = [1, 5, 10, 15];

  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: intervalDuration * 60 * 1000,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: "Using your location",
        notificationBody: "To turn off, go back to the app and switch something off.",
        notificationColor: "#ff0000",
      },
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
    setLocationStarted(hasStarted);
    console.log("tracking started?", hasStarted);
  };

  useEffect(() => {
    const config = async () => {
      let resf = await Location.requestForegroundPermissionsAsync();
      let resb = await Location.requestBackgroundPermissionsAsync();
      if (resf.status != "granted" && resb.status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        console.log("Permission to access location granted");
      }
    };

    config();
  }, []);

  const startLocation = () => {
    startLocationTracking();
  };

  const stopLocation = () => {
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {intervalValues.map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.intervalButton,
              { backgroundColor: intervalDuration === value ? "#efb30d" : "#cccccc" },
            ]}
            onPress={() => setIntervalDuration(value)}
          >
            <Text style={styles.buttonText}>{value} Min</Text>
          </TouchableOpacity>
        ))}
      </View>
      {locationStarted ? (
        <TouchableOpacity onPress={stopLocation}>
          <Text style={styles.btnText}>Stop Tracking</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={startLocation}>
          <Text style={styles.btnText}>Start Tracking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 20,
    backgroundColor: "green",
    color: "white",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 100,
    marginHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  intervalButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.log("LOCATION_TRACKING task ERROR:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    let latitude = locations[0].coords.latitude;
    let longitude = locations[0].coords.longitude;
    sendLocationData(latitude, longitude);
  }
});

export default UserLocation;
