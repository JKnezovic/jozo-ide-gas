import React from "react";
import Alert from "@mui/material/Alert";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
const Statuses = ({ statuses }) => {
  return (
    <div className="statuses">
      {statuses[0] && (
        <Alert
          variant="outlined"
          icon={<SentimentSatisfiedAltIcon style={{ color: "#82C09A" }} />}
          severity="success"
          style={{
            marginBottom: "4px",
            fontSize: "12px",
            borderColor: "#82C09A",
          }}
        >
          {statuses[0]}
        </Alert>
      )}
      {statuses[1] && (
        <Alert
          variant="outlined"
          icon={<SentimentVeryDissatisfiedIcon style={{ color: "#FF9B85" }} />}
          severity="warning"
          style={{ fontSize: "12px", borderColor: "#FF9B85" }}
        >
          {statuses[1]}
        </Alert>
      )}
    </div>
  );
};

export default Statuses;
