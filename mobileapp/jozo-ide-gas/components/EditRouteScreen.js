import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import api from "../api/axiosConfig";
import { describeError } from "../api/errors";

const LOCATION_PATTERN = /^-?[0-9]{1,3}([.][0-9]+)?[ ]*,[ ]*-?[0-9]{1,3}([.][0-9]+)?$/;
const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-CA");
};

export default function EditRouteScreen({ route, navigation }) {
  const { ride } = route.params;
  const media = ride.images ?? [];

  const [routeName, setRouteName] = useState(ride.routeName ?? "");
  const [length, setLength] = useState(String(ride.length ?? 0));
  const [date, setDate] = useState(formatDate(ride.date));
  const [statuses, setStatuses] = useState([ride.statuses?.[0] ?? "", ride.statuses?.[1] ?? ""]);
  const [descriptions, setDescriptions] = useState(media.map((item) => item.desc ?? ""));
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const hasTrack = (ride.positions ?? []).length > 1;

  const changeDescription = (text, index) =>
    setDescriptions((previous) => {
      const next = [...previous];
      next[index] = text;
      return next;
    });

  const handleSave = async () => {
    if (!routeName.trim()) {
      Alert.alert("Name required", "Give the route a name.");
      return;
    }
    if (!DATE_PATTERN.test(date.trim())) {
      Alert.alert("Check the date", "The date must look like 2024-06-21.");
      return;
    }
    const parsedLength = Number(length.trim());
    if (!Number.isFinite(parsedLength)) {
      Alert.alert("Check the length", "Length must be a number. Use 0 for a rest day.");
      return;
    }
    const trimmedLocation = location.trim();
    if (trimmedLocation && !LOCATION_PATTERN.test(trimmedLocation)) {
      Alert.alert("Check the location", "Enter two numbers separated by a comma, like 45.815, 15.982");
      return;
    }

    const payload = {
      routeName: routeName.trim(),
      length: Math.round(parsedLength),
      date: date.trim(),
      statuses,
      mediaDescriptions: descriptions,
    };
    // Only sent when filled in - otherwise the existing track stays as it is.
    if (trimmedLocation) {
      payload.location = trimmedLocation;
    }

    setSaving(true);
    try {
      await api.put(`/api/v1/rides/${ride.id}`, payload);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Could not save", describeError(error, "The route was not saved."));
    } finally {
      setSaving(false);
    }
  };

  const replaceTrack = async () => {
    const picked = await DocumentPicker.getDocumentAsync();
    if (picked.canceled || !picked.assets?.length) {
      return;
    }
    const asset = picked.assets[0];

    Alert.alert("Replace track", `Replace this route track with ${asset.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Replace",
        onPress: async () => {
          const formData = new FormData();
          formData.append("file", { uri: asset.uri, name: asset.name, type: asset.mimeType });
          setSaving(true);
          try {
            await api.post(`/api/v1/rides/${ride.id}/track`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            Alert.alert("Track replaced", "The route now follows the new GPX file.");
          } catch (error) {
            Alert.alert("Could not replace track", describeError(error, "The track was not changed."));
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>Route name</Text>
        <TextInput style={styles.input} value={routeName} onChangeText={setRouteName} />

        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2024-06-21" />

        <Text style={styles.label}>Length (km)</Text>
        <TextInput
          style={styles.input}
          value={length}
          onChangeText={setLength}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Good status</Text>
        <TextInput
          style={styles.input}
          value={statuses[0]}
          onChangeText={(text) => setStatuses((previous) => [text, previous[1]])}
          multiline
        />

        <Text style={styles.label}>Bad status</Text>
        <TextInput
          style={styles.input}
          value={statuses[1]}
          onChangeText={(text) => setStatuses((previous) => [previous[0], text])}
          multiline
        />

        <Text style={styles.sectionTitle}>Track</Text>
        <Text style={styles.hint}>
          {hasTrack
            ? `This route follows a GPX track of ${ride.positions.length} points.`
            : "This route is a single point, as a rest day is."}
        </Text>

        <Text style={styles.label}>Replace with a location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="45.815, 15.982"
        />
        <Text style={styles.hint}>Leave empty to keep the current track.</Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={replaceTrack} disabled={saving}>
          <Text style={styles.secondaryText}>Replace track with a GPX file</Text>
        </TouchableOpacity>

        {media.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Descriptions</Text>
            {media.map((item, index) => (
              <View key={index} style={styles.mediaRow}>
                <Text style={styles.mediaLabel}>
                  {`${item.type === "video" ? "Video" : "Photo"} ${index + 1}`}
                </Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={descriptions[index]}
                  onChangeText={(text) => changeDescription(text, index)}
                  multiline
                />
              </View>
            ))}
          </>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, saving ? styles.disabled : null]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save changes"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 50, width: "85%", alignSelf: "center" },
  label: { fontWeight: "600", marginBottom: 4 },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginTop: 18, marginBottom: 6 },
  hint: { color: "gray", fontSize: 12, marginBottom: 12, marginTop: -6 },
  input: {
    minHeight: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  multiline: { height: 80, textAlignVertical: "top", paddingTop: 8 },
  mediaRow: { marginBottom: 4 },
  mediaLabel: { fontWeight: "600", marginBottom: 4 },
  secondaryButton: {
    borderColor: "#3a3347",
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 6,
  },
  secondaryText: { fontWeight: "600", color: "#3a3347" },
  saveButton: {
    backgroundColor: "#efb30d",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { fontWeight: "700" },
  disabled: { opacity: 0.5 },
});
