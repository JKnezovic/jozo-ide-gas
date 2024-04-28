import React from "react";
import errorImage from "../../assets/error.jpg";

const Loading = () => {
  return (
    <div className="loading-container">
      <img src={errorImage} style={{ height: "50%" }} alt="something went wrong"></img>
      <h3 style={{ color: "gray" }}>Oops something went wrong</h3>
    </div>
  );
};

export default Loading;
