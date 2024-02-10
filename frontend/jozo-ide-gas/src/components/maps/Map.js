import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axiosConfig";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SetBoundsPolyLine from "./SetBoundsPolyLine";
import Legend from "./Legend";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import Moment from "moment";
import L from "leaflet";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
const Map = ({ tripData, setSelectedRide, selectedRide }) => {
  const mapRef = useRef(null);
  const [liveLoaction, setLiveLocation] = useState({ latLng: [53, 19] });
  const [updatedAt, setUpdatedAt] = useState("");
  useEffect(() => {
    // Calculate bounds based on GPX data
    if (mapRef.current && selectedRide) {
      mapRef.current.fitBounds(selectedRide.positions);
    }
  }, [selectedRide]);

  useEffect(() => {
    getLiveLocation();
  }, []);

  const getLiveLocation = async () => {
    try {
      const response = await api.get("/api/v1/live-location");
      setLiveLocation(response.data);
      const time = Moment(response.data.updatedAt).format("LLLL");
      setUpdatedAt(time);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="map" className="home-image-section">
      <MapContainer scrollWheelZoom={true} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tripData && (
          <>
            <SetBoundsPolyLine
              tripData={tripData}
              selectedRide={selectedRide}
              setSelectedRide={setSelectedRide}
            />
          </>
        )}
        <Legend />
        <Marker position={liveLoaction.latLng} icon={DefaultIcon}>
          <Popup>{"Updated at " + updatedAt}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
