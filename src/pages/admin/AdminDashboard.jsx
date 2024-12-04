import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import {
  HomeIcon,
  ArchiveBoxIcon as BoxIcon,
  DocumentTextIcon as DocumentReportIcon,
  Cog6ToothIcon as CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import Overview from './Overview';
import Parcels from './Parcels';
import Reports from './Reports';
import Settings from '../../components/Settings';
import Notifications from '../../components/Notifications';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Parcels', href: '/admin/parcels', icon: BoxIcon },
  { name: 'Reports', href: '/admin/reports', icon: DocumentReportIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
];

const AdminDashboard = ({ user, setUser }) => {
  return (
    <DashboardLayout navigation={navigation} user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/parcels" element={<Parcels />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard; 