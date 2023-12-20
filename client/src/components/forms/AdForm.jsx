import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { GOOGLE_PLACES_KEY } from '../../config.js';
import CurrencyInput from 'react-currency-input-field';
import { useState } from 'react';
import ImageUpload from './ImageUpload.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdForm({ action, type }) {
  const [ad, setAd] = useState({
    photos: [],
    uploading: false,
    price: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    carpark: '',
    landsize: '',

    title: '',
    description: '',
    loading: '',
    type,
    action,
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setAd({ ...ad, loading: true });
      const { data } = await axios.post('/ad', ad);
      if (data?.error) {
        toast.error(data.error);
        setAd({ ...ad, loading: false });
      } else {
        toast.success('Ad created successfully');
        navigate('/dashboard');
      }
    } catch (err) {
      console.log(err);
      setAd({ ...ad, loading: false });
    }
  };

  return (
    <>
      <div className="mb-3 form-control">
        <ImageUpload ad={ad} setAd={setAd} />
        <GooglePlacesAutocomplete
          apiKey={GOOGLE_PLACES_KEY}
          apiOptions={{ region: 'ru' }}
          selectProps={{
            defaultInputValue: ad?.address,
            placeholder: 'Search for address..',
            onChange: ({ value }) => {
              //   console.log("address onchange => ", value.description);
              setAd({ ...ad, address: value.description });
            },
          }}
        />
        <CurrencyInput
          placeholder="Enter price"
          defaultValue={ad.price}
          className="form-control mb-3"
          onValueChange={(value) => setAd({ ...ad, price: value })}
        />
        <input
          type="number"
          min="0"
          className="form-control mb-3"
          placeholder="Enter how many bedrooms"
          value={ad.bedrooms}
          onChange={(e) => setAd({ ...ad, bedrooms: e.target.value })}
          required
        />
        <input
          type="number"
          min="0"
          className="form-control mb-3"
          placeholder="Enter how many bathrooms"
          value={ad.toilets}
          onChange={(e) => setAd({ ...ad, bathrooms: e.target.value })}
          required
        />
        <input
          type="number"
          min="0"
          className="form-control mb-3"
          placeholder="Enter how many car parks"
          value={ad.carpark}
          onChange={(e) => setAd({ ...ad, carpark: e.target.value })}
        />
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Size of land"
          value={ad.landsize}
          onChange={(e) => setAd({ ...ad, landsize: e.target.value })}
        />
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter title"
          value={ad.title}
          onChange={(e) => setAd({ ...ad, title: e.target.value })}
          required
        />
        <textarea
          className="form-control mb-3"
          value={ad.description}
          placeholder="Write description"
          onChange={(e) => setAd({ ...ad, description: e.target.value })}
        />
        <button
          className={`btn btn-primary mb-5 ${ad.loading ? 'disables' : ''} `}
          onClick={handleSubmit}>
          {ad.loading ? 'Loading...' : 'Submit'}
        </button>
        <pre>{JSON.stringify(ad, null, 4)}</pre>
      </div>
    </>
  );
}
