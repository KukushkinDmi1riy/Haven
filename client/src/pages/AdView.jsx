import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import HTMLRenderer from 'react-html-renderer';

import ImageGallery from '../components/cards/ImageGallery';
import AdFeatures from '../components/cards/AdFeatures';
import { formatNumber } from '../helpers/ad.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LikeUnlike from '../components/misc/LikeUnlike';
import MapCard from '../components/cards/MapCard';

import Logo from '../../src/Logo.svg';
import AdCard from '../components/cards/AdCard';
import ContactSeller from '../components/forms/ContactSeller';

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
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary disabled mt-2">
                {ad?.type} for {ad?.action}
              </button>
              <LikeUnlike ad={ad} />
            </div>

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

            <MapCard ad={ad} />

            <br />

            <h1>
              {ad?.type} in {ad?.address} for {ad?.action} ${ad?.price}
            </h1>
            <AdFeatures ad={ad} />
            <hr />
            <h3 className="fw-bold">{ad?.title}</h3>

            <HTMLRenderer html={ad?.description?.replaceAll('.', '<br/><br/>')} />
          </div>
        </div>
      </div>
      <div className="container">
        <ContactSeller ad={ad} />
      </div>
      <div className="container-fluid">
        <h4 className="d-flex justify-content-center">Related Ads</h4>
        <hr style={{ width: '33%' }} />
        <div className="row">
          {related?.map((ad) => (
            <AdCard ad={ad} />
          ))}
        </div>
      </div>
      <pre>{JSON.stringify({ ad, related }, null, 4)}</pre>{' '}
    </>
  );
}
