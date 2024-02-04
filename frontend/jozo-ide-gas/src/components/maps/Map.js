import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SetBoundsPolyLine from "./SetBoundsPolyLine";
import Legend from "./Legend";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
const Map = ({ tripData, setSelectedRide, selectedRide }) => {
  const mapRef = useRef(null);
  const position = [42.5, 18.5];
  useEffect(() => {
    // Calculate bounds based on GPX data
    if (mapRef.current && selectedRide) {
      mapRef.current.fitBounds(selectedRide.positions);
    }
  }, [selectedRide]);

  return (
    <div id="map" className="home-image-section">
      <MapContainer scrollWheelZoom={true} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tripData && (
          <>
            <Polyline
              positions={tripData.gpxData.trackPoints}
              pathOptions={{ color: "#94722E" }}
            />
            <SetBoundsPolyLine
              tripData={tripData}
              selectedRide={selectedRide}
              setSelectedRide={setSelectedRide}
            />
          </>
        )}
        <Legend />
        <Marker position={position} icon={DefaultIcon}>
          <Popup>Updated at 12:45 04.02.2024.</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
