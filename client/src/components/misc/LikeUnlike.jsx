import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import toast from 'react-hot-toast';
import { FcLike, FcLikePlaceholder } from 'react-icons/fc';

export default function LikeUnlike({ ad }) {
  console.log(ad, 'ad from Like');

  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();

  console.log(auth, 'auth from Like');

  const handleLike = async () => {
    try {
      if (auth.user === null) {
        navigate('/login', {
          state: `/ad/${ad.slug}`,
        });
        return;
      }
      const { data } = await axios.post('/wishlist', { adId: ad._id });
      setAuth({ ...auth, user: data });
      const fromLS = JSON.parse(localStorage.getItem('auth'));
      fromLS.user = data;
      localStorage.setItem('auth', JSON.stringify(fromLS));
      toast.success('Successfully added to wishlist');
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnlike = async () => {
    try {
      if (auth.user === null) {
        navigate('/login', {
          state: `/ad/${ad.slug}`,
        });
        return;
      }
      const { data } = await axios.delete(`/wishlist/${ad._id}`);
      setAuth({ ...auth, user: data });
      const fromLS = JSON.parse(localStorage.getItem('auth'));
      fromLS.user = data;
      localStorage.setItem('auth', JSON.stringify(fromLS));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {auth?.user?.wishlist?.includes(ad?._id) ? (
        <span onClick={handleUnlike}>
          <FcLike className="pointer h2 m-2" />
        </span>
      ) : (
        <span onClick={handleLike}>
          <FcLikePlaceholder className="pointer h2 m-2" />
        </span>
      )}
    </>
  );
}
