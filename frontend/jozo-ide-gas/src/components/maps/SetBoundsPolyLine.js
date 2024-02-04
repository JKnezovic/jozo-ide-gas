import React, { useEffect, useMemo, useState } from "react";
import { useMap, Polyline } from "react-leaflet";

const redColor = { color: "#EE6055", weight: 5 };
const blueColor = { color: "#6C8EAD", weight: 5 };

const SetBoundsPolyLine = ({ tripData, selectedRide }) => {
  const [bounds, setBounds] = useState(tripData.tripDataList[0].rideIds[1]);
  const map = useMap();

  useEffect(() => {
    if (selectedRide.positions.length !== 0) {
      setBounds(selectedRide.positions);
      map.fitBounds(selectedRide.positions);
    } else {
    }
  }, [selectedRide, map]);

  const renderPolylines = useMemo(() => {
    return tripData.tripDataList[0].rideIds.map((rideId, index) => {
      const positions = rideId.positions;
      const handlers = {
        click() {
          setBounds(positions);
          map.fitBounds(positions);
        },
      };

      return (
        <Polyline
          key={index}
          positions={positions}
          eventHandlers={handlers}
          pathOptions={bounds === positions ? redColor : blueColor}
        />
      );
    });
  }, [tripData, bounds, map]);

  return <>{renderPolylines}</>;
};

export default SetBoundsPolyLine;
