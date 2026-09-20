import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { LazyLoadImage } from "react-lazy-load-image-component";

// Rides saved before video support have no type at all, so anything that is not
// explicitly a video is treated as an image.
const isVideo = (item) => item?.type === "video";

const CustomOverlay = (props) => {
  return <div className="custom-overlay">{props.images[props.index]?.desc}</div>;
};

const Thumbnail = ({ item }) => {
  if (!isVideo(item)) {
    return <LazyLoadImage className="thumb" src={item.lqipsrc} alt="" />;
  }

  // No poster is generated for videos, so the first frame stands in for one.
  // preload="metadata" fetches enough to paint that frame without pulling the whole file.
  return (
    <>
      <video className="thumb" src={item.src} preload="metadata" muted playsInline />
      <span className="video-badge" aria-hidden="true">
        {"\u25B6"}
      </span>
    </>
  );
};

const Images = ({ images }) => {
  const media = images ?? [];

  return (
    <PhotoProvider overlayRender={(props) => <CustomOverlay {...props} images={media} />}>
      <div className="thumbnail-container">
        {media.map((item, index) => (
          <PhotoView
            key={index}
            // `render` is only consulted when `src` is absent, so the two must not both be set.
            {...(isVideo(item)
              ? {
                  width: 1280,
                  height: 720,
                  render: ({ attrs }) => (
                    <div {...attrs} className="video-stage">
                      <video className="video-player" src={item.src} controls autoPlay playsInline />
                    </div>
                  ),
                }
              : { src: item.src })}
          >
            {index < 3 ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <Thumbnail item={item} />
                {index === 2 && media.length > 3 && (
                  <div className="thumb-overlay">{`+${media.length - 3}`}</div>
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
