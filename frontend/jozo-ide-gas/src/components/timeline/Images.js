import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { LazyLoadImage } from "react-lazy-load-image-component";

const CustomOverlay = (props) => {
  return <div className="custom-overlay">{props.images[props.index]?.desc}</div>;
};

const Images = ({ images }) => {
  return (
    <PhotoProvider overlayRender={(props) => <CustomOverlay {...props} images={images} />}>
      <div className="thumbnail-container">
        {images.map((item, index) => (
          <PhotoView key={index} src={item.src} desc={item.desc}>
            {index < 3 ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <LazyLoadImage className="thumb" src={item.lqipsrc} alt="" />
                {index === 2 && images.length > 3 && (
                  <div className="thumb-overlay">{`+${images.length - 3}`}</div>
                )}
              </div>
            ) : undefined}
          </PhotoView>
        ))}
      </div>
    </PhotoProvider>
  );
};

export default Images;
