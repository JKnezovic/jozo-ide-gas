import React from "react";
import Moment from "moment";

const CurrentlyCycling = ({ updatedAt, mapRef, position }) => {
  const handleClick = () => {
    mapRef.flyTo(position, 12);
  };

  const now = Moment();
  const providedDate = Moment(updatedAt, "dddd, MMMM DD, YYYY HH:mm");
  const differenceInMinutes = now.diff(providedDate, "minutes");

  if (differenceInMinutes < 15) {
    return (
      <div className="currently-cycling-container" onClick={() => handleClick()}>
        <lord-icon
          src="https://cdn.lordicon.com/wvzlkwvr.json"
          trigger="loop"
          colors={"primary:#3a3347,secondary:#93712d"}
          style={{ width: "35px", height: "35px" }}
        ></lord-icon>
        <p style={{ marginBottom: 0 }}>Currently Cycling</p>
      </div>
    );
  } else {
    return null;
  }
};

export default CurrentlyCycling;
