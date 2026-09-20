import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/axiosConfig";
import { describeError } from "../api/errors";

export default function TripFormScreen({ route, navigation }) {
  const existing = route.params?.trip ?? null;
  const isEdit = existing !== null;

  const [tripName, setTripName] = useState(existing?.tripName ?? "");
  const [tripId, setTripId] = useState(existing?.tripId ?? "");
  const [totalLength, setTotalLength] = useState(String(existing?.totalLength ?? ""));
  const [days, setDays] = useState(String(existing?.days ?? ""));
  const [date, setDate] = useState(existing?.date ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [imageSource, setImageSource] = useState(existing?.imageSource ?? "");
  // Only offered when creating: an existing trip changes status from the trips list.
  const [status, setStatus] = useState("ongoing");
  const [saving, setSaving] = useState(false);

  const numberOrNull = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.round(parsed) : NaN;
  };

  const handleSave = async () => {
    if (!tripName.trim()) {
      Alert.alert("Name required", "Give the trip a name.");
      return;
    }
    if (!isEdit && !tripId.trim()) {
      Alert.alert("Id required", "The trip id is what the website links to, e.g. nordkapp.");
      return;
    }

    const parsedLength = numberOrNull(totalLength);
    const parsedDays = numberOrNull(days);
    if (Number.isNaN(parsedLength) || Number.isNaN(parsedDays)) {
      Alert.alert("Check the numbers", "Total length and days must be numbers.");
      return;
    }

    const payload = {
      tripName: tripName.trim(),
      totalLength: parsedLength,
      days: parsedDays,
      description,
      imageSource: imageSource.trim(),
      date: date.trim(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        // tripId is intentionally not sent: the website links to it and rides reference it.
        await api.put(`/api/v1/trips/${existing.tripId}`, payload);
      } else {
        await api.post("/api/v1/trips", { ...payload, tripId: tripId.trim(), status });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Could not save", describeError(error, "The trip was not saved."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>Trip name</Text>
        <TextInput style={styles.input} value={tripName} onChangeText={setTripName} />

        <Text style={styles.label}>Trip id</Text>
        <TextInput
          style={[styles.input, isEdit ? styles.readOnly : null]}
          value={tripId}
          onChangeText={setTripId}
          editable={!isEdit}
          autoCapitalize="none"
          placeholder="nordkapp"
        />
        <Text style={styles.hint}>
          {isEdit
            ? "The id cannot change - the website links to it."
            : "Used in the website address, so keep it lowercase and without spaces."}
        </Text>

        <Text style={styles.label}>Total length (km)</Text>
        <TextInput
          style={styles.input}
          value={totalLength}
          onChangeText={setTotalLength}
          keyboardType="numeric"
        />
        <Text style={styles.hint}>The planned distance - it is what the progress bar counts towards.</Text>

        <Text style={styles.label}>Days</Text>
        <TextInput style={styles.input} value={days} onChangeText={setDays} keyboardType="numeric" />

        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="June 2024" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {isEdit ? null : (
          <>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {["ongoing", "done"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.statusChip, status === option ? styles.statusChipActive : null]}
                  onPress={() => setStatus(option)}
                >
                  <Text style={styles.statusChipText}>{option.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>
              Only one trip can be ongoing at a time. Backfilling an older trip? Create it as done.
            </Text>
          </>
        )}

        <Text style={styles.label}>Card image url</Text>
        <TextInput
          style={styles.input}
          value={imageSource}
          onChangeText={setImageSource}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving ? styles.disabled : null]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>{saving ? "Saving..." : isEdit ? "Save changes" : "Create trip"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 50, width: "85%", alignSelf: "center" },
  label: { fontWeight: "600", marginBottom: 4 },
  hint: { color: "gray", fontSize: 12, marginBottom: 12, marginTop: -6 },
  input: {
    minHeight: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  multiline: { height: 90, textAlignVertical: "top", paddingTop: 8 },
  readOnly: { backgroundColor: "#f0f0f0", color: "gray" },
  saveButton: {
    backgroundColor: "#efb30d",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { fontWeight: "700" },
  disabled: { opacity: 0.5 },
  statusRow: { flexDirection: "row", marginBottom: 12 },
  statusChip: {
    backgroundColor: "#dddddd",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  statusChipActive: { backgroundColor: "#efb30d" },
  statusChipText: { fontWeight: "600", fontSize: 12 },
});
