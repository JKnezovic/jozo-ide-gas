import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LiveLocationScreen from "./components/LiveLocationScreen";
import UploadDailyRideScreen from "./components/UploadDailyRideScreen";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import DeleteRequestScreen from "./components/DeleteRequestScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LiveLocation" component={LiveLocationScreen} />
        <Stack.Screen name="UploadDailyRide" component={UploadDailyRideScreen} />
        <Stack.Screen name="DeleteRequest" component={DeleteRequestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("LiveLocation")}
        >
          <Text style={styles.buttonText}>Live Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("UploadDailyRide")}
        >
          <Text style={styles.buttonText}>Upload Daily Route</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => navigation.navigate("DeleteRequest")}
        >
          <Text style={styles.buttonText}>Delete Daily Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  homeButton: {
    backgroundColor: "#efb30d",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: "red",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  },
});
