import { useEffect, useState } from 'react';
import { useAuth } from '../context/auth';
import { useSearch } from '../context/search';

import axios from 'axios';
import SearchForm from '../components/forms/SearchForm';

import AdCard from '../components/cards/AdCard';

export default function Home() {
  const [auth, setAuth] = useAuth();
  const [search, setSearch] = useSearch();

  const [adsForSell, setAdsForSell] = useState();
  const [adsForRent, setAdsForRent] = useState();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data } = await axios.get('/ads');
      setAdsForSell(data.adsForSell);
      setAdsForRent(data.adsForRent);
    } catch (error) {}
  };

  console.log(search, 'search');

  return (
    <div>
      <SearchForm />
      <h1 className="display-1 bg-primary text-light p-5">For Sell</h1>
      <div className="container">
        <div className="row">
          {adsForSell?.map((ad) => (
            <AdCard ad={ad} key={ad._id} />
          ))}
        </div>
      </div>

      <h1 className="display-1 bg-primary text-light p-5">For Rent</h1>
      <div className="container">
        <div className="row">
          {adsForRent?.map((ad) => (
            <AdCard ad={ad} key={ad._id} />
          ))}
        </div>
      </div>

      <pre> {JSON.stringify({ adsForSell, adsForRent }, null, 4)}</pre>
    </div>
  );
}
