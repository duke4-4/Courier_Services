import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  TruckIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const vehicleTypes = [
  { id: 'motorcycle', name: 'Motorcycle', multiplier: 1, description: 'For small packages up to 20kg' },
  { id: 'car', name: 'Car', multiplier: 1.5, description: 'For medium packages up to 50kg' },
  { id: 'van', name: 'Van', multiplier: 2, description: 'For large packages up to 200kg' },
  { id: 'truck', name: 'Truck', multiplier: 3, description: 'For extra large packages up to 1000kg' },
  { id: 'refrigerated', name: 'Refrigerated Truck', multiplier: 4, description: 'For temperature-controlled items' }
];

const calculateCharge = (weight, vehicleType) => {
  const baseRate = 5; // Base rate starts at $5
  const perKgRate = 0.3; // $0.3 per kg
  const vehicle = vehicleTypes.find(v => v.id === vehicleType);
  return baseRate + (weight * perKgRate * vehicle.multiplier);
};

const NewParcel = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    destination: '',
    weight: '',
    vehicleType: 'van',
    paymentMethod: 'prepaid',
    description: ''
  });

  const [calculatedCharge, setCalculatedCharge] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newParcelId, setNewParcelId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [destinationBranch, setDestinationBranch] = useState(null);
  const [floatAmount, setFloatAmount] = useState(0); // Add float amount state

  useEffect(() => {
    const storedBranches = JSON.parse(localStorage.getItem('branches') || '[]');
    setBranches(storedBranches);
    // Set current operator's branch
    const currentBranch = storedBranches.find(b => b.id === user.branchId);
    setFormData(prev => ({
      ...prev,
      dispatchBranch: currentBranch?.name || '',
      dispatchAddress: currentBranch?.location || ''
    }));
  }, [user.branchId]);

  // Update destination branch when destination city changes
  useEffect(() => {
    if (formData.destination) {
      const branch = branches.find(b => 
        b.location.toLowerCase().includes(formData.destination.toLowerCase())
      );
      setDestinationBranch(branch);
    }
  }, [formData.destination, branches]);

  useEffect(() => {
    if (formData.weight && formData.vehicleType) {
      const charge = calculateCharge(parseFloat(formData.weight), formData.vehicleType);
      setCalculatedCharge(charge);
    }
  }, [formData.weight, formData.vehicleType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const parcelId = `PCL${Date.now().toString().slice(-6)}`;
    const isPrepaid = formData.paymentMethod === 'prepaid';
    const totalAmount = calculatedCharge + Number(floatAmount);
    
    const newParcel = {
      id: parcelId,
      ...formData,
      senderName: user.name,
      senderEmail: user.email,
      senderBranchId: user.branchId,
      dispatchBranch: formData.dispatchBranch,
      dispatchAddress: formData.dispatchAddress,
      destinationBranchId: destinationBranch?.id,
      destinationBranch: destinationBranch?.name,
      status: 'pending',
      amount: calculatedCharge,
      floatAmount: Number(floatAmount),
      totalAmount: totalAmount,
      createdAt: new Date().toISOString(),
      weight: parseFloat(formData.weight),
      isPaid: isPrepaid,
      paidAt: isPrepaid ? new Date().toISOString() : null,
      paidBy: isPrepaid ? user.email : null,
      statusUpdates: [
        {
          status: 'pending',
          updatedAt: new Date().toISOString(),
          updatedBy: user.email,
          branchId: user.branchId,
          branchName: formData.dispatchBranch
        }
      ]
    };

    // Save to localStorage
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    parcels.push(newParcel);
    localStorage.setItem('parcels', JSON.stringify(parcels));

    // If prepaid, update revenue
    if (isPrepaid) {
      const currentRevenue = JSON.parse(localStorage.getItem('revenue') || '0');
      const newRevenue = currentRevenue + calculatedCharge;
      localStorage.setItem('revenue', JSON.stringify(newRevenue));
    }

    // Add notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Notification for new parcel
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: 'admin@hot.co.zw',
      title: 'New Parcel Created',
      message: `New parcel ${parcelId} has been created by ${user.name}`,
      createdAt: new Date().toISOString()
    });

    // Additional notification for prepaid payment
    if (isPrepaid) {
      notifications.push({
        id: `notif-${Date.now() + 1}`,
        userId: 'admin@hot.co.zw',
        title: 'Payment Received',
        message: `Payment of $${calculatedCharge.toFixed(2)} received for parcel ${parcelId}`,
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));

    setNewParcelId(parcelId);
    setShowConfirmation(true);
  };

  const handlePrint = () => {
    navigate(`/sender/print?parcelId=${newParcelId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
          <h2 className="text-2xl font-bold text-gray-900">Send New Parcel</h2>
          <p className="mt-1 text-sm text-gray-600">Fill in the details to create a new parcel delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Receiver Details Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Receiver Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
                    value={formData.receiverEmail}
                    onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                >
                  <option value="">Select destination</option>
                  <option value="harare">Harare</option>
                  <option value="bulawayo">Bulawayo</option>
                  <option value="gweru">Gweru</option>
                  <option value="mutare">Mutare</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parcel Details Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Parcel Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  className="mt-1 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Type</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`relative rounded-lg border p-4 cursor-pointer ${
                    formData.vehicleType === vehicle.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, vehicleType: vehicle.id })}
                >
                  <div className="flex items-center">
                    <TruckIcon className="h-6 w-6 text-gray-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{vehicle.name}</h4>
                      <p className="text-xs text-gray-500">{vehicle.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="prepaid"
                  name="paymentMethod"
                  type="radio"
                  value="prepaid"
                  checked={formData.paymentMethod === 'prepaid'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                />
                <label htmlFor="prepaid" className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">Pay Now</span>
                  <span className="block text-sm text-gray-500">Pay before delivery</span>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cash"
                  name="paymentMethod"
                  type="radio"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                />
                <label htmlFor="cash" className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">Cash Payment</span>
                  <span className="block text-sm text-gray-500">Pay with cash on delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Add Float Amount Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Charges</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Float Amount (Optional)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={floatAmount}
                    onChange={(e) => setFloatAmount(e.target.value)}
                    className="pl-7 block w-full shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Additional amount that can be paid later
                </p>
              </div>
            </div>
          </div>

          {/* Update Charge Display */}
          {calculatedCharge > 0 && (
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delivery Charges</h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-600">Base charge: $5.00</p>
                    <p className="text-sm text-gray-600">
                      Weight charge: ${((calculatedCharge - 5) || 0).toFixed(2)}
                    </p>
                    {floatAmount > 0 && (
                      <p className="text-sm text-gray-600">
                        Float amount: ${Number(floatAmount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-600">
                    ${(calculatedCharge + Number(floatAmount)).toFixed(2)}
                  </p>
                  {floatAmount > 0 && (
                    <p className="text-sm text-gray-500">
                      (Includes ${Number(floatAmount).toFixed(2)} float)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Dispatch Information Display */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dispatch Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch Branch</label>
                <input
                  type="text"
                  readOnly
                  value={formData.dispatchBranch}
                  className="mt-1 block w-full bg-gray-50 shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch Address</label>
                <input
                  type="text"
                  readOnly
                  value={formData.dispatchAddress}
                  className="mt-1 block w-full bg-gray-50 shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Create Parcel
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Parcel Created Successfully</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Your parcel has been created with ID: <span className="font-medium">{newParcelId}</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Total charge: <span className="font-medium">${calculatedCharge.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                Print Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewParcel;