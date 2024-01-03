import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function Login() {
  const [auth, setAuth] = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post('/login', {
        email,
        password,
      });
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
      } else {
        setAuth(data);
        localStorage.setItem('auth', JSON.stringify(data));
        toast.success('Successfully login!');
        setLoading(false);
        location?.state !== null ? navigate(location.state) : navigate('/dashboard');
      }
      console.log(data);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error('Something went wrong. Try again later.');
    }
  };

  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Login</h1>

      <div className="container">
        <div className="row">
          <div className="col-md-4 offset-md-4 mt-5">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter your email"
                className="form-control mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <input
                type="password"
                placeholder="Enter your password"
                className="form-control mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button disabled={loading} className="btn btn-primary col-12 mb-4">
                {loading ? 'Waiteng...' : 'Login'}
              </button>
            </form>

            <Link to="/auth/forgot-password" className="text-danger">
              Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
