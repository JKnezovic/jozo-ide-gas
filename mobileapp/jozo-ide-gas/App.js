// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LiveLocationScreen from "./components/LiveLocationScreen";
import PostRequestScreen from "./components/PostRequestScreen";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LiveLocation" component={LiveLocationScreen} />
        <Stack.Screen name="PostRequest" component={PostRequestScreen} />
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
          onPress={() => navigation.navigate("PostRequest")}
        >
          <Text style={styles.buttonText}>Post Requests</Text>
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
  buttonText: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  },
});
