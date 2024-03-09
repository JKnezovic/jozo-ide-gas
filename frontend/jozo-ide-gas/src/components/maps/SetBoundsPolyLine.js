import React, { useMemo } from "react";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";

const goldColor = { color: "#93712D", weight: 5 };
const blueColor = { color: "#6B92B2", weight: 5 };

let redDotIcon = L.divIcon({ className: "gold-dot-icon" });
let blueDotIcon = L.divIcon({ className: "blue-dot-icon" });

const SetBoundsPolyLine = ({ tripData, selectedRide, setSelectedRide, scrollRef }) => {
  const bounds = selectedRide.positions;

  const renderPolylines = useMemo(() => {
    return tripData.rideIds.map((rideId, index) => {
      const length = tripData.rideIds.length - 1;
      const positions = rideId.positions;
      const handlers = {
        click() {
          setSelectedRide(rideId);
          const selectedItem = scrollRef.current.childNodes[length - index];
          selectedItem.scrollIntoView({ behavior: "smooth", block: "center" });
        },
      };

      return (
        <div key={index}>
          {positions.length !== 1 && (
            <Polyline
              positions={positions}
              eventHandlers={handlers}
              pathOptions={bounds === positions ? goldColor : blueColor}
            />
          )}
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
