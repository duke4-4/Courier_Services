import { Routes, Route } from 'react-router-dom';
import {
  PlusIcon,
  QueueListIcon as CollectionIcon,
  Cog6ToothIcon as CogIcon,
  BellIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import NewParcel from './NewParcel';
import MyParcels from './MyParcels';
import Settings from '../../components/Settings';
import Notifications from '../../components/Notifications';
import PrintReceipt from '../shared/PrintReceipt';

const navigation = [
  { name: 'New Parcel', href: '/sender', icon: PlusIcon },
  { name: 'My Parcels', href: '/sender/parcels', icon: CollectionIcon },
  { name: 'Settings', href: '/sender/settings', icon: CogIcon },
  { name: 'Notifications', href: '/sender/notifications', icon: BellIcon },
  { name: 'Print Receipt', href: '/sender/print', icon: PrinterIcon },
];

const calculateCharge = (weight, distance, vehicleType) => {
  // Base rate per kg
  const baseRate = 2;
  // Rate per km
  const kmRate = 0.5;
  // Vehicle multiplier
  const vehicleMultiplier = {
    van: 1,
    truck: 1.5,
    cargo: 2
  };

  return weight * baseRate + distance * kmRate * vehicleMultiplier[vehicleType];
};

const SenderDashboard = ({ user, setUser }) => {
  return (
    <DashboardLayout navigation={navigation} user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<NewParcel user={user} calculateCharge={calculateCharge} />} />
        <Route path="/parcels" element={<MyParcels user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
        <Route path="/print" element={<PrintReceipt />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SenderDashboard;