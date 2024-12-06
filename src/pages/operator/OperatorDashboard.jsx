import { Routes, Route } from 'react-router-dom';
import {
  PlusIcon,
  QueueListIcon as CollectionIcon,
  Cog6ToothIcon as CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import NewParcel from '../sender/NewParcel';
import MyParcels from '../sender/MyParcels';
import Settings from '../../components/Settings';
import Notifications from '../../components/Notifications';
import PrintReceipt from '../shared/PrintReceipt';

const navigation = [
  { name: 'New Parcel', href: '/operator', icon: PlusIcon },
  { name: 'Manage Parcels', href: '/operator/parcels', icon: CollectionIcon },
  { name: 'Settings', href: '/operator/settings', icon: CogIcon },
  { name: 'Notifications', href: '/operator/notifications', icon: BellIcon },
];

const OperatorDashboard = ({ user, setUser }) => {
  return (
    <DashboardLayout navigation={navigation} user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<NewParcel user={user} />} />
        <Route path="/parcels" element={<MyParcels user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
        <Route path="/print" element={<PrintReceipt />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OperatorDashboard; 