import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axiosConfig";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SetBoundsPolyLine from "./SetBoundsPolyLine";
import Legend from "./Legend";
import pinIcon from "../../assets/location-pin.png";
import Moment from "moment";
import L from "leaflet";
import "./Map.css";
import CurrentlyCycling from "../loading/CurrentlyCycling";
let DefaultIcon = L.icon({
  iconUrl: pinIcon,
  iconAnchor: [16, 32],
});
const Map = ({ tripData, setSelectedRide, selectedRide, scrollRef, liveLocation, mapVisible }) => {
  const mapRef = useRef(null);
  const [liveLoaction, setLiveLocation] = useState({ latLng: [53, 19] });
  const [updatedAt, setUpdatedAt] = useState("");
  useEffect(() => {
    if (mapRef.current && selectedRide) {
      mapRef.current.fitBounds(selectedRide.positions, { maxZoom: 9 });
    }
  }, [selectedRide]);

  useEffect(() => {
    getLiveLocation();
  }, []);

  const getLiveLocation = async () => {
    try {
      const response = await api.get("/api/v1/live-location");
      setLiveLocation(response.data);
      const time = Moment(response.data.updatedAt).format("dddd, MMMM DD, YYYY HH:mm");
      setUpdatedAt(time);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="map" className={"map-section" + (mapVisible ? "" : " none")}>
      <MapContainer scrollWheelZoom={true} ref={mapRef} zoom={9} center={selectedRide.positions[0]}>
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
              scrollRef={scrollRef}
            />
          </>
        )}
        <Legend liveLocation={liveLocation} />
        {liveLocation && (
          <CurrentlyCycling
            updatedAt={updatedAt}
            mapRef={mapRef.current}
            position={liveLoaction.latLng}
          />
        )}
        {liveLocation && (
          <Marker position={liveLoaction.latLng} icon={DefaultIcon}>
            <Popup>{"Updated at " + updatedAt}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
