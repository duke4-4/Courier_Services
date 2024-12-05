import { Routes, Route } from 'react-router-dom';
import {
  MagnifyingGlassIcon as SearchIcon,
  Cog6ToothIcon as CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import TrackParcel from './TrackParcel';
import Settings from '../../components/Settings';
import Notifications from '../../components/Notifications';
import PrintReceipt from '../shared/PrintReceipt';

const navigation = [
  { name: 'Track Parcel', href: '/receiver', icon: SearchIcon },
  { name: 'Settings', href: '/receiver/settings', icon: CogIcon },
  { name: 'Notifications', href: '/receiver/notifications', icon: BellIcon },
];

const ReceiverDashboard = ({ user, setUser }) => {
  return (
    <DashboardLayout navigation={navigation} user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<TrackParcel user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
        <Route path="/print" element={<PrintReceipt />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ReceiverDashboard;