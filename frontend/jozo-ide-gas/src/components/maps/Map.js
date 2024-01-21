import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ tripData }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Calculate bounds based on GPX data
    if (
      mapRef.current &&
      tripData &&
      tripData.gpxData &&
      tripData.gpxData.trackPoints.length > 0
    ) {
      const trackPoints = tripData.gpxData.trackPoints;
      const bounds = trackPoints.reduce(
        (acc, point) => [
          [Math.min(acc[0][0], point.lat), Math.min(acc[0][1], point.lon)],
          [Math.max(acc[1][0], point.lat), Math.max(acc[1][1], point.lon)],
        ],
        [
          [Infinity, Infinity],
          [-Infinity, -Infinity],
        ]
      );

      // Fit map to bounds
      if (
        bounds[0][0] !== Infinity &&
        bounds[0][1] !== Infinity &&
        bounds[1][0] !== -Infinity &&
        bounds[1][1] !== -Infinity
      ) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [tripData]);

  return (
    <div id="map" className="home-image-section">
      <MapContainer scrollWheelZoom={true} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tripData && tripData.gpxData && (
          <Polyline positions={tripData.gpxData.trackPoints} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
