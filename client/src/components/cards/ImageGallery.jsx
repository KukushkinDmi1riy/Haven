// components/cards/ImageGallery.js
import React, { useState, useCallback } from 'react';
import Gallery from 'react-photo-gallery';
import Carousel from 'react-images';
import * as carus from 'react-images';

// const photos = [
//   {
//     src: 'https://itmo-haven.s3.eu-north-1.amazonaws.com/G0xGJaTydw0EpXNjig2df.jpeg',
//     width: 1,
//     height: 1,
//   },
//   {
//     src: 'https://itmo-haven.s3.eu-north-1.amazonaws.com/016XJJddGw6rnTiLm4JPL.jpeg',
//     width: 1,
//     height: 1,
//   },
// ];

export default function ImageGallery({photos}) {
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrent(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrent(0);
    setIsOpen(false);
  };

  return (
    <div>
      <Gallery photos={photos} onClick={openLightbox} />
      <carus.ModalGateway>
        {isOpen ? (
          <carus.Modal onClose={closeLightbox}>
            <Carousel
              currentIndex={current}
              views={photos.map((x) => ({
                ...x,
                srcset: x.srcSet,
                caption: x.title,
              }))}
            />
          </carus.Modal>
        ) : null}
      </carus.ModalGateway>
    </div>
  );
}
