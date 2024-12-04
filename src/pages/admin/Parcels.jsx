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
  const [parcels, setParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [revenue, setRevenue] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

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
    setSelectedParcel(parcel);
    setShowPrintModal(true);
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || parcel.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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

      {/* Status Update Modal */}
      {showStatusModal && selectedParcel && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Update Parcel Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Status: {selectedParcel.status}</p>
                <p className="text-sm text-gray-500">Payment Type: {selectedParcel.paymentType}</p>
              </div>
              <div className="flex flex-col space-y-2">
                {selectedParcel.status === 'pending' && (
                  <button
                    onClick={() => updateParcelStatus(selectedParcel.id, 'in_transit')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Mark as In Transit
                  </button>
                )}
                {selectedParcel.status === 'in_transit' && (
                  <button
                    onClick={() => updateParcelStatus(selectedParcel.id, 'delivered')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Mark as Delivered
                  </button>
                )}
                {selectedParcel.status === 'delivered' && (
                  <button
                    onClick={() => updateParcelStatus(selectedParcel.id, 'received')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Confirm Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && selectedParcel && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Print Label</h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <PDFViewer style={{width: '100%', height: '300px'}}>
              <Document>
                <Page size="A6" style={styles.page}>
                  <View>
                    <Text style={styles.text}>Parcel ID: {selectedParcel.id}</Text>
                    <Text style={styles.text}>Destination: {selectedParcel.destinationCity}</Text>
                    <Text style={styles.text}>Receiver: {selectedParcel.receiverName}</Text>
                  </View>
                </Page>
              </Document>
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parcels; 