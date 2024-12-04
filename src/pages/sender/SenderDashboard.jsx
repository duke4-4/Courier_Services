import { Routes, Route } from 'react-router-dom';
import {
  PlusIcon,
  QueueListIcon as CollectionIcon,
  Cog6ToothIcon as CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import NewParcel from './NewParcel';
import MyParcels from './MyParcels';
import Settings from '../../components/Settings';
import Notifications from '../../components/Notifications';

const navigation = [
  { name: 'New Parcel', href: '/sender', icon: PlusIcon },
  { name: 'My Parcels', href: '/sender/parcels', icon: CollectionIcon },
  { name: 'Settings', href: '/sender/settings', icon: CogIcon },
  { name: 'Notifications', href: '/sender/notifications', icon: BellIcon },
];

const SenderDashboard = ({ user, setUser }) => {
  return (
    <DashboardLayout navigation={navigation} user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<NewParcel user={user} />} />
        <Route path="/parcels" element={<MyParcels user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SenderDashboard; 