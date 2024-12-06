import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon as SearchIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';
import UpdateParcelStatus from './UpdateParcelStatus';

const MyParcels = ({ user }) => {
  const [parcels, setParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const userParcels = allParcels.filter(parcel => parcel.sender === user.email);
    setParcels(userParcels);
  }, [user.email]);

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || parcel.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (updatedParcel) => {
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedParcels = parcels.map(p => 
      p.id === updatedParcel.id ? updatedParcel : p
    );
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    loadParcels(); // Refresh the list
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Parcels</h1>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:justify-start">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search parcels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="ml-4 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
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
                      Amount
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Dispatch Branch
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Destination Branch
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.receiver}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.destinationCity}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          parcel.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : parcel.status === 'in_transit'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {parcel.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${parcel.amount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.dispatchBranch}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.destinationBranch}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedParcel(parcel);
                            setShowUpdateModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Update Status
                        </button>
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