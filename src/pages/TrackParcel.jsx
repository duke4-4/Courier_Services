import React, { useState } from 'react';

const TrackParcel = () => {
  const [parcelDetails, setParcelDetails] = useState({});
  const [updateMessage, setUpdateMessage] = useState('');

  const handleParcelUpdate = (action) => {
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedParcels = parcels.map(parcel => {
      if (parcel.parcelId === parcelDetails.parcelId) {
        const updates = {
          status: 'delivered',
          deliveredAt: new Date().toISOString(),
          isPaid: action === 'paid'
        };
        
        // Create notification for admin
        const notification = {
          id: `notif-${Date.now()}`,
          userId: 'admin@hot.co.zw',
          title: 'Parcel Delivery Update',
          message: `Parcel ${parcel.parcelId} has been marked as ${action === 'paid' ? 'delivered and paid' : 'delivered'}`,
          createdAt: new Date().toISOString(),
        };
        
        // Save notification
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));

        return { ...parcel, ...updates };
      }
      return parcel;
    });

    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    setParcelDetails(updatedParcels.find(p => p.parcelId === parcelDetails.parcelId));
    setUpdateMessage(`Parcel successfully marked as ${action === 'paid' ? 'delivered and paid' : 'delivered'}`);
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* ... existing form and error display ... */}

      {updateMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {updateMessage}
        </div>
      )}

      {parcelDetails && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Parcel Details</h3>
          <div className="space-y-2">
            {/* ... existing parcel details ... */}
            <p><span className="font-medium">Payment Status:</span> {parcelDetails.isPaid ? 'Paid' : 'Pending Payment'}</p>
            <p><span className="font-medium">Amount:</span> ${parcelDetails.amount}</p>
            
            {parcelDetails.status !== 'delivered' && (
              <div className="mt-4 space-x-2">
                {parcelDetails.paymentMethod === 'cash' ? (
                  <button
                    onClick={() => handleParcelUpdate('paid')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Mark as Paid & Received
                  </button>
                ) : (
                  <button
                    onClick={() => handleParcelUpdate('received')}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Mark as Received
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcel; 