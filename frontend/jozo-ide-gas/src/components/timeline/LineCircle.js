import React from "react";

const LineCircle = ({ routeName, selectedRide }) => {
  const bgColor = routeName === selectedRide.routeName ? "#EE6055" : "#6C8EAD";

  return (
    <div className="line-circle">
      <div
        className="circle"
        style={{
          backgroundColor: bgColor,
        }}
      />
      <div className="line-div" style={{ backgroundColor: bgColor }}></div>
    </div>
  );
};

export default LineCircle;
