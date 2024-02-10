import React, { useMemo } from "react";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";

const redColor = { color: "#EE6055", weight: 5 };
const blueColor = { color: "#6C8EAD", weight: 5 };

let redDotIcon = L.divIcon({ className: "red-dot-icon" });
let blueDotIcon = L.divIcon({ className: "blue-dot-icon" });

const SetBoundsPolyLine = ({ tripData, selectedRide, setSelectedRide, scrollRef }) => {
  const bounds = selectedRide.positions;

  const renderPolylines = useMemo(() => {
    return tripData.rideIds.map((rideId, index) => {
      const positions = rideId.positions;
      const handlers = {
        click() {
          setSelectedRide(rideId);
          const selectedItem = scrollRef.current.childNodes[index];
          selectedItem.scrollIntoView({ behavior: "smooth", block: "center" });
        },
      };

      return (
        <div key={index}>
          <Polyline
            positions={positions}
            eventHandlers={handlers}
            pathOptions={bounds === positions ? redColor : blueColor}
          />
          <Marker
            position={positions[positions.length - 1]}
            icon={bounds === positions ? redDotIcon : blueDotIcon}
            eventHandlers={handlers}
          ></Marker>
        </div>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripData, bounds]);

  return <>{renderPolylines}</>;
};

export default SetBoundsPolyLine;
