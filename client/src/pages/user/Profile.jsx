import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import slugify from 'slugify';
import SideBar from '../../components/nav/SideBar';

import ProfileUpload from '../../components/forms/ProfileUpload';

export default function Profile() {
  //context
  const [auth, setAuth] = useAuth();

  //state
  const [username, setUserName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  //hooks

  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user) {
      setUserName(auth.user?.username);
      setName(auth.user?.name);
      setEmail(auth.user?.email);
      setCompany(auth.user?.company);
      setAddress(auth.user?.address);
      setPhone(auth.user?.address);
      setAbout(auth.user?.about);
      setPhoto(auth.user?.photo);
    }
  }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        const { data } = await axios.put('/update-profile', {
          username,
          name,
          email,
          company,
          address,
          phone,
          about,
          photo,
        });
        if (data?.error) {
          toast.error(data.error);
        } else {
          setAuth({ ...auth, user: data });

          let fromLS = JSON.parse(localStorage.getItem('auth'));
          fromLS.user = data;
          localStorage.setItem('auth', JSON.stringify(fromLS));
          setLoading(false);
          toast.success('Profile updated');
        }
      } catch (err) {
        console.log(err);
      }
    };

  return (
    <>
      <h1 className="display-1 bg-primary text-light p-5">Profile</h1>

      <div className="container-fluid">
        <SideBar />
        <div className="container mt-2">
          <div className="row">
            <div className="col-lg-8 offset-lg-2 mt-2">
              <ProfileUpload
                photo={photo}
                setPhoto={setPhoto}
                uploading={uploading}
                setUploading={setUploading}
              />
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your username"
                  value={username}
                  onChange={(e) => {
                    setUserName(slugify(e.target.value.toLowerCase()));
                  }}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  disabled={true}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your company name"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                  }}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                  }}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Update your about"
                  value={about}
                  maxLength={200}
                  onChange={(e) => {
                    setAbout(e.target.value);
                  }}
                />
                <button className="btn btn-primary col-12 mb-2" disabled={loading}>
                  {loading ? 'Processing' : 'Update profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
