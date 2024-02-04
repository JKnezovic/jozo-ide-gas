import React from "react";
import PlaceIcon from "@mui/icons-material/Place";

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <PlaceIcon
          style={{ color: "hsl(207.41deg 66.94% 47.45%)", marginRight: "5px" }}
          fontSize="medium"
        />
        <span className="legend-label">Latest live location</span>
      </div>
      <div className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: "#EE6055" }}
        ></span>
        <span className="legend-label">Selected route</span>
      </div>
      <div className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: "#6C8EAD" }}
        ></span>
        <span className="legend-label">Route</span>
      </div>
    </div>
  );
};

export default Legend;
