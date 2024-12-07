import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon as SearchIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import UpdateParcelStatus from './UpdateParcelStatus';
import { subscribeToUpdates, EVENTS, syncData, loadParcelsWithSync } from '../../utils/realTimeUpdates';

const MyParcels = ({ user }) => {
  const [parcels, setParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const loadParcels = () => {
    console.log('Loading parcels...'); // Debug log
    const allParcels = loadParcelsWithSync();
    const branchParcels = allParcels.filter(parcel => 
      parcel.senderBranchId === user.branchId ||
      parcel.destinationBranchId === user.branchId
    );
    setParcels(branchParcels);
    syncData(); // Force sync after loading
  };

  useEffect(() => {
    loadParcels();

    const unsubscribe = subscribeToUpdates((update) => {
      console.log('Received update:', update); // Debug log
      if ([EVENTS.PARCEL_UPDATED, EVENTS.PARCEL_CREATED, EVENTS.STATUS_UPDATED, 
           EVENTS.PAYMENT_RECEIVED, 'SYNC'].includes(update.type)) {
        loadParcels();
      }
    });

    // Poll more frequently
    const refreshInterval = setInterval(() => {
      loadParcels();
    }, 5000); // Poll every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [user.branchId]);

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

    // Update revenue
    const currentRevenue = JSON.parse(localStorage.getItem('revenue') || '0');
    const newRevenue = currentRevenue + parcel.totalAmount;
    localStorage.setItem('revenue', JSON.stringify(newRevenue));

    // Add notification
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
        return 'bg-gray-100 text-gray-800';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'received':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Branch Parcels</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage parcels from your branch
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search parcels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="received">Received</option>
        </select>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Parcel ID
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Receiver
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Destination
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Float
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Payment Status
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredParcels.map((parcel) => (
                    <tr key={parcel.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.id}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">{parcel.receiverName}</div>
                          <div className="text-gray-500">{parcel.receiverEmail}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.destinationBranch || parcel.destination}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(parcel.status)}`}>
                          {parcel.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${parcel.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.floatAmount > 0 ? (
                          <span className="text-orange-600">
                            +${parcel.floatAmount.toFixed(2)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            parcel.isPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {parcel.isPaid ? 'Paid' : 'Pending'}
                          </span>
                          {parcel.isPaid && (
                            <span className="text-xs text-gray-500">
                              {new Date(parcel.paidAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => {
                              setSelectedParcel(parcel);
                              setShowUpdateModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Update Status
                          </button>
                          {!parcel.isPaid && parcel.status === 'delivered' && (
                            <button
                              onClick={() => handlePaymentReceived(parcel)}
                              className="inline-flex items-center text-green-600 hover:text-green-900"
                            >
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              Mark Paid
                            </button>
                          )}
                        </div>
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