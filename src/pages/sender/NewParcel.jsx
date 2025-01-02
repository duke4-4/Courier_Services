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
// import { broadcastUpdate, EVENTS, syncData } from '../../utils/realTimeUpdates';

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
  const [floatAmount, setFloatAmount] = useState('0');

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
    const totalAmount = calculatedCharge + Number(floatAmount || 0);
    
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

    // Broadcast and sync
    broadcastUpdate(EVENTS.PARCEL_CREATED, newParcel);
    syncData();
    
    console.log('Parcel created and synced:', newParcel); // Debug log

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
    navigate(`/operator/print?parcelId=${newParcelId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-3xl font-bold text-white">Send New Parcel</h2>
            <p className="mt-2 text-orange-100">Complete the form below to create a new delivery</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Receiver Details Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Receiver Details</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="pl-10 w-full h-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      value={formData.receiverName}
                      onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                      placeholder="Enter receiver's name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="pl-10 w-full h-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      value={formData.receiverEmail}
                      onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                      placeholder="Enter receiver's email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      className="pl-10 w-full h-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      value={formData.receiverPhone}
                      onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                      placeholder="Enter receiver's phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <select
                    required
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Parcel Details</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Enter weight in kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the parcel contents"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Vehicle Type</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicleTypes.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                      formData.vehicleType === vehicle.id
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                    onClick={() => setFormData({ ...formData, vehicleType: vehicle.id })}
                  >
                    <div className="flex items-center">
                      <TruckIcon className={`h-8 w-8 ${formData.vehicleType === vehicle.id ? 'text-orange-500' : 'text-gray-400'}`} />
                      <div className="ml-4">
                        <h4 className="text-base font-medium text-gray-900">{vehicle.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{vehicle.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Payment Method</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50/50 transition-colors duration-200">
                  <input
                    id="prepaid"
                    name="paymentMethod"
                    type="radio"
                    value="prepaid"
                    checked={formData.paymentMethod === 'prepaid'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="h-5 w-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="prepaid" className="ml-4 flex-1">
                    <span className="block text-base font-medium text-gray-900">Pay Now</span>
                    <span className="block text-sm text-gray-500 mt-1">Pay before delivery</span>
                  </label>
                </div>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50/50 transition-colors duration-200">
                  <input
                    id="cash"
                    name="paymentMethod"
                    type="radio"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="h-5 w-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="cash" className="ml-4 flex-1">
                    <span className="block text-base font-medium text-gray-900">Cash Payment</span>
                    <span className="block text-sm text-gray-500 mt-1">Pay with cash on delivery</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Add Float Amount Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Additional Charges</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Float Amount (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={floatAmount}
                    onChange={(e) => setFloatAmount(e.target.value)}
                    className="pl-10 w-full h-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Additional amount that can be paid later</p>
              </div>
            </div>

            {/* Charge Display */}
            {calculatedCharge > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Delivery Charges</h3>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-600">Base charge: <span className="font-medium">$5.00</span></p>
                      <p className="text-sm text-gray-600">
                        Weight charge: <span className="font-medium">${((calculatedCharge - 5) || 0).toFixed(2)}</span>
                      </p>
                      {floatAmount > 0 && (
                        <p className="text-sm text-gray-600">
                          Float amount: <span className="font-medium">${Number(floatAmount).toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-orange-600">
                      ${(calculatedCharge + Number(floatAmount)).toFixed(2)}
                    </p>
                    {floatAmount > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        (Includes ${Number(floatAmount).toFixed(2)} float)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dispatch Information */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Dispatch Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Branch</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.dispatchBranch}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Address</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.dispatchAddress}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Parcel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Success!</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-8">
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  Parcel ID: <span className="font-bold">{newParcelId}</span>
                </p>
                <p className="mt-2 text-green-700">
                  Total charge: <span className="font-bold">${calculatedCharge.toFixed(2)}</span>
                </p>
              </div>
              <p className="text-gray-600">Your parcel has been successfully created and is ready for processing.</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <PrinterIcon className="h-5 w-5 inline-block mr-2" />
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
