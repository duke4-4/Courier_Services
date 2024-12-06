import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const UpdateParcelStatus = ({ parcel, onClose, onUpdate, user }) => {
  const [newStatus, setNewStatus] = useState(parcel.status);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const statusUpdate = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
      branchId: user.branchId,
      notes: notes
    };

    const updatedParcel = {
      ...parcel,
      status: newStatus,
      statusUpdates: [...(parcel.statusUpdates || []), statusUpdate]
    };

    // Add notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: parcel.receiverEmail,
      title: 'Parcel Status Updated',
      message: `Your parcel ${parcel.id} status has been updated to ${newStatus}`,
      createdAt: new Date().toISOString()
    });
    notifications.push({
      id: `notif-${Date.now() + 1}`,
      userId: 'admin@hot.co.zw',
      title: 'Parcel Status Updated',
      message: `Parcel ${parcel.id} status updated to ${newStatus} by ${user.name}`,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('notifications', JSON.stringify(notifications));
    onUpdate(updatedParcel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Update Parcel Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default UpdateParcelStatus; 