import React from "react";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
const legendData = [
  { background: "red-background", label: "Latest live location" },
  { background: "gold-background", label: "Selected day route" },
  { background: "blue-background", label: "Whole Route" },
];

const Legend = ({ liveLocation }) => {
  const legendItems = legendData.map((item, index) => {
    if (liveLocation === false && index === 0) return null;
    else
      return (
        <div className="legend-item" key={index}>
          <div className={`legend-color ${item.background}`}>
            <PlaceOutlinedIcon fontSize="inherit" style={{ margin: "3px" }} />
          </div>
          <span className="legend-label">{item.label}</span>
        </div>
      );
  });
  return <div className="legend">{legendItems}</div>;
};

export default Legend;
