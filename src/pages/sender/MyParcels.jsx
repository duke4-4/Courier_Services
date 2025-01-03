import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon as SearchIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import UpdateParcelStatus from './UpdateParcelStatus';

const MyParcels = ({ user }) => {
  const [parcels, setParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const loadParcels = async () => {
    console.log('Loading parcels...');
    const allParcels = await loadParcelsWithSync();
    const branchParcels = allParcels.filter(parcel => 
      parcel.senderBranchId === user.branchId ||
      parcel.destinationBranchId === user.branchId
    );
    setParcels(branchParcels);
    await syncData();
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = 
      parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiverEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || parcel.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (updatedParcel) => {
    const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedParcels = allParcels.map(p => 
      p.id === updatedParcel.id ? updatedParcel : p
    );
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    loadParcels();
  };

  const handlePaymentReceived = (parcel) => {
    const updatedParcel = {
      ...parcel,
      isPaid: true,
      paidAt: new Date().toISOString(),
      paidBy: user.email,
      status: parcel.status === 'delivered' ? 'received' : parcel.status
    };

    const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedParcels = allParcels.map(p => 
      p.id === parcel.id ? updatedParcel : p
    );
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));

    const currentRevenue = JSON.parse(localStorage.getItem('revenue') || '0');
    const newRevenue = currentRevenue + parcel.totalAmount;
    localStorage.setItem('revenue', JSON.stringify(newRevenue));

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: 'admin@hot.co.zw', 
      title: 'Payment Received',
      message: `Payment of $${parcel.totalAmount.toFixed(2)} received for parcel ${parcel.id}`,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    loadParcels();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      case 'in_transit':
        return 'bg-amber-100 text-amber-800 ring-amber-600/20';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20';
      case 'received':
        return 'bg-sky-100 text-sky-800 ring-sky-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Branch Parcels</h1>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            View and manage all parcels from your branch in one place
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 block w-full shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-0 ring-1 ring-inset ring-gray-300 rounded-xl bg-white/5 px-4 py-3"
            placeholder="Search by ID, receiver name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none block w-full sm:w-48 pl-3 pr-10 py-3 text-base border-0 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl bg-white/5"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="received">Received</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcel Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Timeline
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Info
                    </th>
                    <th className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredParcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-900">{parcel.id}</span>
                          <span className="text-sm font-medium text-gray-700">{parcel.receiverName}</span>
                          <span className="text-sm text-gray-500">{parcel.receiverEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{parcel.destinationBranch || parcel.destination}</div>
                        <div className="text-xs text-gray-500 mt-1">Created: {new Date(parcel.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${getStatusColor(parcel.status)}`}>
                          {parcel.status === 'in_transit' && <TruckIcon className="mr-1.5 h-4 w-4" />}
                          {parcel.status === 'delivered' && <CheckCircleIcon className="mr-1.5 h-4 w-4" />}
                          {parcel.status === 'pending' && <ClockIcon className="mr-1.5 h-4 w-4" />}
                          {parcel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-sm font-medium text-gray-900">
                            ${parcel.amount?.toFixed(2) || '0.00'}
                            {parcel.floatAmount > 0 && (
                              <span className="ml-2 text-orange-600">+${parcel.floatAmount.toFixed(2)}</span>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                            parcel.isPaid ? 'bg-emerald-100 text-emerald-800 ring-emerald-600/20' : 'bg-amber-100 text-amber-800 ring-amber-600/20'
                          }`}>
                            {parcel.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => {
                            setSelectedParcel(parcel);
                            setShowUpdateModal(true);
                          }}
                          className="inline-flex items-center px-3.5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                          Update
                        </button>
                        {!parcel.isPaid && parcel.status === 'delivered' && (
                          <button
                            onClick={() => handlePaymentReceived(parcel)}
                            className="inline-flex items-center px-3.5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                          >
                            <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showUpdateModal && selectedParcel && (
        <UpdateParcelStatus
          parcel={selectedParcel}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleStatusUpdate}
          user={user}
        />
      )}
    </div>
  );
};

export default MyParcels;