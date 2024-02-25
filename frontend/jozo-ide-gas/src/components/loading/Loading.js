import React from "react";

const Loading = () => {
  return (
    <div className="loading-container">
      <lord-icon
        src="https://cdn.lordicon.com/wvzlkwvr.json"
        trigger="loop"
        colors="primary:#3a3347,secondary:#93712d"
        style={{ width: "150px", height: "150px" }}
      ></lord-icon>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
