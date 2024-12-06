import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon as SearchIcon,
  TruckIcon,
  CheckCircleIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center'
  }
});

const Parcels = () => {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [revenue, setRevenue] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filterPayment, setFilterPayment] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    setParcels(storedParcels);
    const storedRevenue = JSON.parse(localStorage.getItem('revenue') || '0');
    setRevenue(storedRevenue);
  };

  const updateParcelStatus = (parcelId, newStatus) => {
    const updatedParcels = parcels.map(parcel => {
      if (parcel.id === parcelId) {
        // Handle revenue updates for delivered parcels
        if (newStatus === 'delivered') {
          if (parcel.paymentType === 'prepaid') {
            updateRevenue(parcel.amount);
            addNotification({
              userId: parcel.sender,
              title: 'Parcel Delivered',
              message: `Your parcel ${parcel.id} has been delivered successfully.`
            });
          } else if (parcel.paymentType === 'pay_forward') {
            // For pay forward, we'll update revenue when receiver confirms
            addNotification({
              userId: parcel.receiver,
              title: 'Parcel Received - Payment Required',
              message: `Your parcel ${parcel.id} has been delivered. Please complete the payment.`
            });
          }
          addNotification({
            userId: parcel.receiver,
            title: 'Parcel Delivered',
            message: `A parcel ${parcel.id} has been delivered to you. Please confirm receipt.`
          });
        } 
        // Handle in-transit notifications
        else if (newStatus === 'in_transit') {
          addNotification({
            userId: parcel.sender,
            title: 'Parcel In Transit',
            message: `Your parcel ${parcel.id} is now in transit.`
          });
          addNotification({
            userId: parcel.receiver,
            title: 'Parcel In Transit',
            message: `A parcel ${parcel.id} is on its way to you.`
          });
        }
        // Handle received status (confirmed by receiver)
        else if (newStatus === 'received') {
          if (parcel.paymentType === 'pay_forward') {
            updateRevenue(parcel.amount);
          }
          addNotification({
            userId: parcel.sender,
            title: 'Parcel Received',
            message: `Your parcel ${parcel.id} has been received and confirmed by the recipient.`
          });
        }
        
        return { ...parcel, status: newStatus };
      }
      return parcel;
    });

    setParcels(updatedParcels);
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    setShowStatusModal(false);
  };

  const updateRevenue = (amount) => {
    const newRevenue = revenue + amount;
    setRevenue(newRevenue);
    localStorage.setItem('revenue', JSON.stringify(newRevenue));
  };

  const addNotification = (notification) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const newNotification = {
      id: `notif-${Date.now()}`,
      ...notification,
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const handlePrintLabel = (parcel) => {
    // Format the parcel data to match the expected structure
    const formattedParcel = {
      ...parcel,
      // Ensure these fields exist and are properly formatted
      senderName: parcel.senderName || parcel.sender,
      senderEmail: parcel.senderEmail || parcel.sender,
      receiverName: parcel.receiverName || parcel.receiver,
      receiverEmail: parcel.receiverEmail,
      receiverPhone: parcel.receiverPhone,
      destination: parcel.destination || parcel.destinationCity,
      weight: parcel.weight,
      vehicleType: parcel.vehicleType,
      paymentMethod: parcel.paymentMethod,
      amount: parcel.amount,
      status: parcel.status,
      createdAt: parcel.createdAt,
      isPaid: parcel.isPaid,
      paidAt: parcel.paidAt,
      paidBy: parcel.paidBy,
      receivedAt: parcel.receivedAt,
      receivedBy: parcel.receivedBy,
      description: parcel.description
    };

    // Store the formatted parcel temporarily in localStorage
    localStorage.setItem('temp_print_parcel', JSON.stringify(formattedParcel));
    
    // Navigate to print view
    navigate(`/admin/print?parcelId=${parcel.id}`);
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || parcel.status === filterStatus;
    const matchesPayment = filterPayment === 'all' ||
      (filterPayment === 'paid' && parcel.isPaid) ||
      (filterPayment === 'unpaid' && !parcel.isPaid) ||
      (filterPayment === 'cash' && parcel.paymentMethod === 'cash');
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Parcels</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Parcel
          </button>
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
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="cash">Cash on Delivery</option>
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
                      Sender
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Receiver
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.sender}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parcel.receiver}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          parcel.isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : parcel.paymentMethod === 'prepaid'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {parcel.isPaid 
                            ? 'Paid' 
                            : parcel.paymentMethod === 'prepaid'
                            ? 'Payment Failed'
                            : 'Cash on Delivery'}
                        </span>
                        {parcel.isPaid && (
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(parcel.paidAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedParcel(parcel);
                            setShowStatusModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 mr-4"
                          title="Update Status"
                        >
                          <span className="sr-only">Update Status</span>
                          {/* You can add an appropriate icon here */}
                          Status
                        </button>
                        <button
                          onClick={() => handlePrintLabel(parcel)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Print Parcel Label"
                        >
                          <PrinterIcon className="h-5 w-5" />
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

      {/* Status Update Modal with Detailed Information */}
      {showStatusModal && selectedParcel && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Parcel Details</h3>
                <p className="mt-1 text-sm text-gray-500">ID: {selectedParcel.id}</p>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Branch Information</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dispatch Branch</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedParcel.dispatchBranch}</dd>
                    <dd className="text-xs text-gray-500">{selectedParcel.dispatchAddress}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Destination Branch</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedParcel.destinationBranch}</dd>
                  </div>
                </dl>
              </div>

              {/* Status History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Status History</h4>
                <div className="space-y-4">
                  {selectedParcel.statusUpdates?.map((update, index) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{update.status}</p>
                          <p className="text-xs text-gray-500">
                            By: {update.updatedBy} ({update.branchName})
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(update.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      {update.notes && (
                        <p className="mt-1 text-sm text-gray-600">{update.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sender Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Sender Details</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedParcel.senderName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedParcel.senderEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Operator ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedParcel.senderBranchId}</dd>
                  </div>
                </dl>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Payment Details</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Base Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">${selectedParcel.amount.toFixed(2)}</dd>
                  </div>
                  {selectedParcel.floatAmount > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Float Amount</dt>
                      <dd className="mt-1 text-sm text-gray-900">${selectedParcel.floatAmount.toFixed(2)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="mt-1 text-sm font-medium text-orange-600">
                      ${selectedParcel.totalAmount.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        selectedParcel.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedParcel.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </dd>
                  </div>
                  {selectedParcel.isPaid && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Paid By</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedParcel.paidBy}</dd>
                      <dd className="text-xs text-gray-500">
                        {new Date(selectedParcel.paidAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handlePrintLabel(selectedParcel)}
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

export default Parcels; 