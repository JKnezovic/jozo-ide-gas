import React, { useEffect, useMemo, useState } from "react";
import { useMap, Polyline, Marker } from "react-leaflet";
import L from "leaflet";

const redColor = { color: "#EE6055", weight: 5 };
const blueColor = { color: "#6C8EAD", weight: 5 };

let redDotIcon = L.divIcon({ className: "red-dot-icon" });
let blueDotIcon = L.divIcon({ className: "blue-dot-icon" });

const SetBoundsPolyLine = ({ tripData, selectedRide }) => {
  const [bounds, setBounds] = useState(tripData.rideIds[1]);
  const map = useMap();

  useEffect(() => {
    if (selectedRide.positions.length !== 0) {
      setBounds(selectedRide.positions);
      map.fitBounds(selectedRide.positions);
    } else {
    }
  }, [selectedRide, map]);

  const renderPolylines = useMemo(() => {
    return tripData.rideIds.map((rideId, index) => {
      const positions = rideId.positions;
      const handlers = {
        click() {
          setBounds(positions);
          map.fitBounds(positions);
        },
      };

      return (
        <>
          <Polyline
            key={index}
            positions={positions}
            eventHandlers={handlers}
            pathOptions={bounds === positions ? redColor : blueColor}
          />
          <Marker
            position={positions[positions.length - 1]}
            icon={bounds === positions ? redDotIcon : blueDotIcon}
            eventHandlers={handlers}
          ></Marker>
        </>
      );
    });
  }, [tripData, bounds, map]);

  return <>{renderPolylines}</>;
};

export default SetBoundsPolyLine;
