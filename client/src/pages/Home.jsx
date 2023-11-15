import { useAuth } from '../context/auth';

export default function Home() {
  const [auth, setAuth] = useAuth();
  console.log(auth, 'sdfg');
  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Home</h1>
    </div>
  );
}
