import { useState } from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const UpdateParcelStatus = ({ parcel, onClose, onUpdate, user }) => {
  const navigate = useNavigate();
  const [newStatus, setNewStatus] = useState(parcel.status);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showPrintOption, setShowPrintOption] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if payment is required for status change
    if (newStatus === 'received' && !parcel.isPaid) {
      setError('Payment must be received before marking as received');
      return;
    }

    const statusUpdate = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
      branchId: user.branchId,
      branchName: user.branchName,
      notes: notes
    };

    const updatedParcel = {
      ...parcel,
      status: newStatus,
      statusUpdates: [...(parcel.statusUpdates || []), statusUpdate]
    };

    onUpdate(updatedParcel);
    
    // Show print option if status is changed to received
    if (newStatus === 'received') {
      setShowPrintOption(true);
    } else {
      onClose();
    }
  };

  const handlePrint = () => {
    navigate(`/operator/print?parcelId=${parcel.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {showPrintOption ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Parcel Received</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <p className="text-green-800">
                Parcel has been marked as received. Would you like to print a receipt?
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                Print Receipt
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Parcel Status</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="received">Received</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  rows="3"
                />
              </div>

              {!parcel.isPaid && (
                <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 rounded text-sm">
                  Note: Payment (${parcel.totalAmount?.toFixed(2)}) is pending
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Update Status
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateParcelStatus; 