import SideBar from '../../../components/nav/SideBar';
import AdForm from '../../../components/forms/AdForm';

export default function RentHouse() {
  return (
    <div className="contaienr-fluid">
      <h1 className="display-1 bg-primary text-light p-5">Rent House</h1>
      <SideBar />
      <div className="container mt-2 vh-100">
        <AdForm action="Rent" type="House" />
      </div>
    </div>
  );
}
