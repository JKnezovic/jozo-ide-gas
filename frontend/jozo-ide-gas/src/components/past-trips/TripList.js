import React from "react";
import Card from "./Card";
const TripList = ({ tripData }) => {
  return (
    <div className="past-trips">
      <div className="cards-container">
        {tripData.map((trip, index) => (
          <Card
            key={index}
            tripName={trip.tripName}
            totalLength={trip.totalLength}
            description={trip.description}
            days={trip.days}
            imageSource={trip.imageSource}
            date={trip.date}
            tripId={trip.tripId}
          />
        ))}
      </div>
    </div>
  );
};

export default TripList;
