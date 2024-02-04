import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";

const CustomOverlay = (props) => {
  return <div className="custom-overlay">{props.images[props.index]?.desc}</div>;
};

const Images = ({ images }) => {
  return (
    <PhotoProvider overlayRender={(props) => <CustomOverlay {...props} images={images} />}>
      <div className="foo" style={{ marginTop: "20px", marginBottom: "20px" }}>
        {images.map((item, index) => (
          <PhotoView key={index} src={item.src} desc={item.desc}>
            {index < 3 ? <img className="thumb" src={item.src} alt="" loading="lazy" /> : undefined}
          </PhotoView>
        ))}
      </div>
    </PhotoProvider>
  );
};

export default Images;
