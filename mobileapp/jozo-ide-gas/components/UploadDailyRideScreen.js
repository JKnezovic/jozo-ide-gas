import React, { useState } from "react";
import { View, TextInput, Button, Image, Alert, StyleSheet, ScrollView, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../api/axiosConfig";

const UploadDailyRideScreen = () => {
  const [routeName, setRouteName] = useState("Gata");
  const [tripId, setTripId] = useState("Prevlaka");
  const [length, setLength] = useState("0");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [statuses, setStatuses] = useState(["", ""]);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [location, setLocation] = useState("");

  const selectImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImageDescriptions = Array(result.assets.length).fill("");
      setImageDescriptions((prevDescriptions) => [...prevDescriptions, ...newImageDescriptions]);
      setImages([...images, ...result.assets]);
    }
  };

  const handleImageDescriptionChange = (text, index) => {
    setImageDescriptions((prevDescriptions) => {
      const newDescriptions = [...prevDescriptions];
      newDescriptions[index] = text;
      return newDescriptions;
    });
  };

  const selectFile = async () => {
    let result = await DocumentPicker.getDocumentAsync();
    if (!result.cancelled) {
      setFile(result);
      setSelectedFileName(result.assets[0].name);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("routeName", routeName);
      formData.append("tripId", tripId);
      formData.append("length", length);
      formData.append("date", date);
      formData.append("statuses", statuses);
      formData.append("imageDescriptions", imageDescriptions);

      if (file) {
        formData.append("file", {
          uri: file.assets[0].uri,
          name: file.assets[0].name,
          type: file.assets[0].mimeType,
        });
      } else {
        formData.append("location", location);
      }

      images.forEach((image) => {
        formData.append("images", {
          uri: image.uri,
          name: image.fileName,
          type: "image/jpeg",
        });
      });

      const response = await api.post("/api/v1/rides", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Request submitted successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit request");
    }
  };

  const handleGoodStatusChange = (text) => {
    setStatuses((prevStatuses) => [text, prevStatuses[1]]);
  };

  const handleBadStatusChange = (text) => {
    setStatuses((prevStatuses) => [prevStatuses[0], text]);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Route Name"
          value={routeName}
          onChangeText={setRouteName}
        />
        <TextInput
          style={styles.input}
          placeholder="Trip ID"
          value={tripId}
          onChangeText={setTripId}
        />
        <TextInput
          style={styles.input}
          placeholder="Length"
          value={length}
          onChangeText={setLength}
        />
        <TextInput style={styles.input} placeholder="Date" value={date} onChangeText={setDate} />
        <TextInput
          style={styles.input}
          placeholder="Good status"
          value={statuses[0]}
          onChangeText={handleGoodStatusChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Bad status"
          value={statuses[1]}
          onChangeText={handleBadStatusChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <Button title="Select File" onPress={selectFile} />
        <Text style={styles.fileName}>{"Selected File: " + selectedFileName}</Text>
        <Button title="Select Image" onPress={selectImage} />
        <View style={styles.containerDesc}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={{ width: 100, height: 100 }} />
              <TextInput
                style={[styles.imageInput]}
                placeholder="Image Description"
                multiline={true}
                value={imageDescriptions[index]}
                onChangeText={(text) => handleImageDescriptionChange(text, index)}
              />
            </View>
          ))}
        </View>
        <Button title="Submit" color={"#f194ff"} onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  imageInput: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
    paddingHorizontal: 10,
    width: "64%",
  },
  container: {
    marginTop: 20,
    marginBottom: 50,
    width: "80%",
    alignSelf: "center",
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginRight: 10,
  },
  containerDesc: {
    marginVertical: 10,
  },
  fileName: {
    marginVertical: 10,
    color: "gray",
  },
});

export default UploadDailyRideScreen;
