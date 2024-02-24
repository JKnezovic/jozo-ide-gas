import React from "react";
const Statuses = ({ statuses }) => {
  return (
    <div className="statuses">
      {statuses[0] && (
        <div className="status-container">
          <p className="bulletin" style={{ color: "#8bd49b" }}>
            {"\u2B24"}
          </p>
          <p className="status">{statuses[0]}</p>
        </div>
      )}
      {statuses[1] && (
        <div className="status-container">
          <p className="bulletin" style={{ color: "#F16254" }}>
            {"\u2B24"}
          </p>
          <p className="status">{statuses[1]}</p>
        </div>
      )}
    </div>
  );
};

export default Statuses;
