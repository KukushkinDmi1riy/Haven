import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/pre-register', {
        email,
        password,
      });
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success('Please check your email to activate account');
      }
      console.log(data);
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong. Try again later.');
    }
  };

  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Register</h1>

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

              <button className="btn btn-primary col-12 mb-4">Login</button>
            </form>

            <a className="text-danger pointer">Forgot Password</a>
          </div>
        </div>
      </div>
    </div>
  );
}
