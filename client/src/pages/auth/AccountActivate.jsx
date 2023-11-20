import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';

import axios from 'axios';
import toast from 'react-hot-toast';

export default function AccountActivate() {
  const { token } = useParams();
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) requestActivation();
  }, [token]);

  const requestActivation = async () => {
    try {
      const { data } = await axios.post('/register', { token });
      if (data?.error) {
        toast.error(data.error);
      } else {
        //save in localStorage
        localStorage.setItem('auth', JSON.stringify(data));
        //save in context
        setAuth(data);
        navigate('/');
        toast.success('Successfully register. Welcome to our HOME!');
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong.');
    }
  };

  console.log(token);

  return (
    <div
      className="display-1 d-flex justify-content-center align-items-center vh-100"
      style={{ marginTop: '-5%' }}>
      Please wait...
    </div>
  );
}
