import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ImageGallery from '../components/cards/ImageGallery';
import AdFeatures from '../components/cards/AdFeatures'
import { formatNumber} from '../helpers/ad.js';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';

import Logo from '../../src/Logo.svg';

dayjs.extend(relativeTime);

export default function AdView() {
  const [ad, setAd] = useState({});
  const [related, setRelated] = useState([]);

  console.log(ad, 'ad');

  const params = useParams();

  useEffect(() => {
    fetchAd();
  }, []);

  const fetchAd = async () => {
    try {
      const { data } = await axios.get(`/ad/${params?.slug}`);
      setAd(data?.ad);
      setRelated(data?.related);
    } catch (err) {
      console.log(err);
    }
  };

  const generatePhotosArray = (photos) => {
    console.log(photos);
    if (photos?.length > 0) {
      const x = photos?.length === 1 ? 2 : 4;
      let arr = [];
      photos.map((p) =>
        arr.push({
          src: p.Location,
          width: x,
          height: x,
        }),
      );
      return arr;
    } else {
      return [
        {
          src: Logo,
          width: 2,
          height: 1,
        },
      ];
    }
  };
  return (
    <>
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-lg-4">
            <button className="btn btn-primary disabled mt-2">
              {ad?.type} for {ad?.action}
            </button>
            <br />
            <p className="text-danger h5 m-2 mt-5">{ad?.sold ? '❌ Off market' : '✅ In market'}</p>
            <h1 className="mt-4">{ad.address}</h1>
            <AdFeatures ad={ad} />
            <h3 className="mt-3">${formatNumber(ad.price)}</h3>

            <p className="d-flex justify-content-between mt-4">
              <span>Added {dayjs(ad?.createdAt).fromNow()}</span> 
			  <span>{ad?.views} Views</span>
            </p>
          </div>

          <div className="col-lg-8">
            <ImageGallery photos={generatePhotosArray(ad?.photos)} />
          </div>
        </div>
      </div>
      <pre>{JSON.stringify({ ad, related }, null, 4)}</pre>{' '}
    </>
  );
}
