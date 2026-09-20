import React, { useState } from "react";
import { View, TextInput, Button, Image, Alert, StyleSheet, ScrollView, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../api/axiosConfig";

const UploadDailyRideScreen = () => {
  const [routeName, setRouteName] = useState("");
  const [tripId, setTripId] = useState("Nordkapp");
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.5,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImageDescriptions = Array(result.assets.length).fill("");
      setImageDescriptions((prevDescriptions) => [...prevDescriptions, ...newImageDescriptions]);
      setImages([...images, ...result.assets]);
    }
  };

  const isVideo = (asset) =>
    asset.type === "video" || (asset.mimeType ?? "").startsWith("video/");

  // The server decides image vs video from the part's content type, so it has to be right.
  const mimeTypeOf = (asset) => asset.mimeType ?? (isVideo(asset) ? "video/mp4" : "image/jpeg");

  const fileNameOf = (asset, index) =>
    asset.fileName ?? `media-${index + 1}.${isVideo(asset) ? "mp4" : "jpg"}`;

  const handleImageDescriptionChange = (text, index) => {
    setImageDescriptions((prevDescriptions) => {
      const newDescriptions = [...prevDescriptions];
      newDescriptions[index] = text;
      return newDescriptions;
    });
  };

  const selectFile = async () => {
    let result = await DocumentPicker.getDocumentAsync();
    if (result.canceled || !result.assets?.length) {
      return;
    }
    setFile(result);
    setSelectedFileName(result.assets[0].name);
  };

  const clearFile = () => {
    setFile(null);
    setSelectedFileName("");
  };

  const handleSubmit = async () => {
    // A ride needs a shape on the map: either a GPX track or a single point. Without one
    // the server has nothing to place the day at and the upload fails after the photos
    // have already been sent.
    const trimmedLocation = location.trim();
    if (!file && !trimmedLocation) {
      Alert.alert("Location required", 'Pick a GPX file, or enter a location as "latitude, longitude".');
      return;
    }
    if (!file && !/^-?[0-9]{1,3}([.][0-9]+)?[ ]*,[ ]*-?[0-9]{1,3}([.][0-9]+)?$/.test(trimmedLocation)) {
      Alert.alert("Check the location", 'Enter two numbers separated by a comma, for example "45.815, 15.982".');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("routeName", routeName);
      formData.append("tripId", tripId);
      formData.append("length", length);
      formData.append("date", date);
      // Append one part per entry. Passing the arrays straight to FormData would
      // stringify them into a single comma-joined field, which the server then has to
      // split back apart - losing any text that itself contains a comma.
      statuses.forEach((status) => formData.append("statuses", status));
      images.forEach((_, index) => formData.append("imageDescriptions", imageDescriptions[index] ?? ""));

      if (file) {
        formData.append("file", {
          uri: file.assets[0].uri,
          name: file.assets[0].name,
          type: file.assets[0].mimeType,
        });
      } else {
        formData.append("location", trimmedLocation);
      }

      images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          // iOS frequently hands back an asset with no fileName at all.
          name: fileNameOf(image, index),
          type: mimeTypeOf(image),
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
          placeholder={file ? "Location (using GPX file)" : "Location - e.g. 45.815, 15.982"}
          value={location}
          onChangeText={setLocation}
          editable={!file}
        />
        <Button title="Select File" onPress={selectFile} />
        <Text style={styles.fileName}>
          {selectedFileName ? "Selected File: " + selectedFileName : "No file selected"}
        </Text>
        {selectedFileName ? <Button title="Clear File" onPress={clearFile} /> : null}
        <Button title="Select Photos / Videos" onPress={selectImage} />
        <View style={styles.containerDesc}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              {isVideo(image) ? (
                <View style={styles.videoPlaceholder}>
                  <Text style={styles.videoPlaceholderText}>VIDEO</Text>
                  {image.duration ? (
                    <Text style={styles.videoDuration}>
                      {Math.round(image.duration / 1000) + "s"}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Image source={{ uri: image.uri }} style={{ width: 100, height: 100 }} />
              )}
              <TextInput
                style={[styles.imageInput]}
                placeholder={isVideo(image) ? "Video Description" : "Image Description"}
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
  videoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#3a3347",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholderText: {
    color: "#efb30d",
    fontWeight: "700",
    letterSpacing: 1,
  },
  videoDuration: {
    color: "#cccccc",
    fontSize: 12,
    marginTop: 4,
  },
});

export default UploadDailyRideScreen;
