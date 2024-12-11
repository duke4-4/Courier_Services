import { useState } from 'react';
import { parcelDb } from '../services/db/parcels';
import { webSocket } from '../services/websocket/WebSocketService';

const ParcelForm = ({ user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target);
      const parcelData = {
        senderName: user.name,
        senderEmail: user.email,
        senderBranchId: user.branchId,
        dispatchBranch: user.branchName,
        dispatchAddress: formData.get('dispatchAddress'),
        receiverName: formData.get('receiverName'),
        receiverEmail: formData.get('receiverEmail'),
        receiverPhone: formData.get('receiverPhone'),
        destinationBranch: formData.get('destinationBranch'),
        destinationBranchId: formData.get('destinationBranchId'),
        description: formData.get('description'),
        weight: parseFloat(formData.get('weight')),
        vehicleType: formData.get('vehicleType'),
        paymentMethod: formData.get('paymentMethod'),
        amount: parseFloat(formData.get('amount')),
        totalAmount: parseFloat(formData.get('totalAmount'))
      };

      const newParcel = await parcelDb.create(parcelData);
      webSocket.notifyParcelUpdate(newParcel);
      onSuccess(newParcel);
      e.target.reset();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component JSX
}; 