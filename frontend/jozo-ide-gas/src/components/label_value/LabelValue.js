import React from "react";

const LabelValue = ({ label, value }) => {
  return (
    <div className="label-value-container">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
    </div>
  );
};

export default LabelValue;
