import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  PrinterIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const TrackParcel = ({ user }) => {
  const navigate = useNavigate();
  const [parcelId, setParcelId] = useState('');
  const [parcelDetails, setParcelDetails] = useState(null);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const parcel = parcels.find(p => p.id === parcelId);

    if (parcel) {
      setParcelDetails(parcel);
      setError('');
    } else {
      setParcelDetails(null);
      setError('Parcel not found');
    }
  };

  const handleConfirmReceipt = () => {
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedParcels = parcels.map(p => {
      if (p.id === parcelDetails.id) {
        return {
          ...p,
          status: 'received',
          receivedAt: new Date().toISOString(),
          receivedBy: user.email
        };
      }
      return p;
    });

    localStorage.setItem('parcels', JSON.stringify(updatedParcels));

    // Add notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: parcelDetails.senderEmail,
      title: 'Parcel Received',
      message: `Your parcel ${parcelDetails.id} has been received by the recipient.`,
      createdAt: new Date().toISOString()
    });
    notifications.push({
      id: `notif-${Date.now() + 1}`,
      userId: 'admin@hot.co.zw',
      title: 'Parcel Received',
      message: `Parcel ${parcelDetails.id} has been received by the recipient.`,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Update parcel details in state
    setParcelDetails(prev => ({
      ...prev,
      status: 'received',
      receivedAt: new Date().toISOString(),
      receivedBy: user.email
    }));

    setShowConfirmModal(false);

    // If payment is needed, show payment modal
    if (parcelDetails.paymentMethod === 'cod' && !parcelDetails.isPaid) {
      setShowPaymentModal(true);
    }
  };

  const handlePayment = () => {
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedParcels = parcels.map(p => {
      if (p.id === parcelDetails.id) {
        return {
          ...p,
          isPaid: true,
          paidAt: new Date().toISOString(),
          paidBy: user.email
        };
      }
      return p;
    });

    localStorage.setItem('parcels', JSON.stringify(updatedParcels));

    // Update revenue
    const currentRevenue = JSON.parse(localStorage.getItem('revenue') || '0');
    localStorage.setItem('revenue', JSON.stringify(currentRevenue + parcelDetails.amount));

    // Add notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: 'admin@hot.co.zw',
      title: 'Payment Received',
      message: `Payment of $${parcelDetails.amount.toFixed(2)} received for parcel ${parcelDetails.id}`,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Update parcel details in state
    setParcelDetails(prev => ({
      ...prev,
      isPaid: true,
      paidAt: new Date().toISOString(),
      paidBy: user.email
    }));

    setShowPaymentModal(false);
  };

  const handlePrint = () => {
    navigate(`/receiver/print?parcelId=${parcelDetails.id}`);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Track Parcel</h1>
          <p className="mt-2 text-sm text-gray-700">
            Enter your parcel ID to track its current status and location.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <form onSubmit={handleTrack} className="space-y-6">
          <div className="max-w-3xl">
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="focus:ring-orange-500 focus:border-orange-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                  placeholder="Enter Parcel ID"
                  value={parcelId}
                  onChange={(e) => setParcelId(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                Track
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {parcelDetails && (
          <div className="mt-8">
            {parcelDetails.paymentMethod === 'cash' && !parcelDetails.isPaid && (
              <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-orange-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">Payment Required</h3>
                    <p className="mt-1 text-sm text-orange-700">
                      Amount owing: <span className="font-bold">${parcelDetails.amount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Parcel Details</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {parcelDetails.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {parcelDetails.paymentMethod === 'cash' && !parcelDetails.isPaid && (
                    <div className="text-right mr-4">
                      <p className="text-sm text-gray-500">Amount Due</p>
                      <p className="text-lg font-bold text-orange-600">
                        ${parcelDetails.amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Parcel ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {parcelDetails.id}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Sender</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {parcelDetails.sender}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        parcelDetails.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : parcelDetails.status === 'in_transit'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {parcelDetails.status}
                      </span>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Destination</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {parcelDetails.destinationCity}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {parcelDetails.description}
                    </dd>
                  </div>
                  {parcelDetails.status === 'delivered' && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Delivered At</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(parcelDetails.deliveredAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        parcelDetails.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {parcelDetails.isPaid ? 'Paid' : 'Payment Pending'}
                      </span>
                      {parcelDetails.isPaid && (
                        <span className="ml-2 text-gray-500">
                          Paid on {new Date(parcelDetails.paidAt).toLocaleDateString()}
                        </span>
                      )}
                      {!parcelDetails.isPaid && parcelDetails.paymentMethod === 'cash' && (
                        <span className="ml-2 text-orange-600">
                          Cash payment required on delivery
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {parcelDetails.paymentMethod === 'prepaid' ? 'Paid Online' : 'Cash on Delivery'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <span className={`font-medium ${
                        !parcelDetails.isPaid && parcelDetails.paymentMethod === 'cash'
                          ? 'text-orange-600'
                          : 'text-gray-900'
                      }`}>
                        ${parcelDetails.amount.toFixed(2)}
                      </span>
                      {!parcelDetails.isPaid && parcelDetails.paymentMethod === 'cash' && (
                        <span className="ml-2 text-sm text-gray-500">(Due on delivery)</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="px-4 py-5 sm:px-6 flex justify-end space-x-4">
                {parcelDetails.status === 'delivered' && !parcelDetails.receivedBy && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Confirm Receipt
                  </button>
                )}
                
                {parcelDetails.status === 'received' && 
                 parcelDetails.paymentMethod === 'cash' && 
                 !parcelDetails.isPaid && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Pay Now (${parcelDetails.amount.toFixed(2)})
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PrinterIcon className="h-5 w-5 mr-2" />
                  Print Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Receipt</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to confirm receipt of this parcel? 
              {parcelDetails?.paymentMethod === 'cod' && 
                ` Payment of $${parcelDetails.amount.toFixed(2)} will be required.`}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceipt}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Required</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Please confirm payment for your parcel delivery:
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-600">
                ${parcelDetails?.amount.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcel;