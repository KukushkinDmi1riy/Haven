import SideBar from '../../../components/nav/SideBar';
import AdForm from '../../../components/forms/AdForm';

export default function SellHouse() {
  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Ad Create</h1>
      <SideBar />
      <div className="container mt-2 vh-100">
        <AdForm action="Sell" type="House" />
      </div>
    </div>
  );
}
