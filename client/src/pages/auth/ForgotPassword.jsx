import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // console.log(email, password);
      const { data } = await axios.post(`/forgot-password`, {
        email,
      });
      // console.log(data);
      if (data?.error) {
        toast.error(data?.error);
        setLoading(false);
      } else {
        setLoading(false);
        toast.success('Check email to access your account');
        navigate('/');
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast.error('Something went wrong. Try again.');
    }
  };

  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Forgot Password</h1>

      <div className="container">
        <div className="row">
          <div className="col-md-4 offset-md-4 mt-5">
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-control mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <button className="btn btn-primary col-12 mb-4" disabled={loading}>
                {loading ? 'Waiting...' : 'Forgot password'}
              </button>
            </form>

            <Link to="/login" className="text-danger">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
