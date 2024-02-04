import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SetBoundsPolyLine from "./SetBoundsPolyLine";

const Map = ({ tripData, setSelectedRide, selectedRide }) => {
  const mapRef = useRef(null);

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
      </MapContainer>
    </div>
  );
};

export default Map;
