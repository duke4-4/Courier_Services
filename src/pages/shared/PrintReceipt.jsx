import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { XMarkIcon } from '@heroicons/react/24/outline';
import logoImage from '../../assets/Logoo.png';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #EA580C', // orange-600
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 70,
    objectFit: 'contain',
  },
  dateSection: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    color: '#1F2937', // gray-800
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937', // gray-800
    backgroundColor: '#F3F4F6', // gray-100
    padding: 5,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280', // gray-500
  },
  value: {
    flex: 2,
    fontSize: 10,
    color: '#1F2937', // gray-800
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EA580C', // orange-600
    borderTopStyle: 'solid',
  },
  totalValue: {
    color: '#EA580C', // orange-600
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280', // gray-500
    borderTop: '1px solid #E5E7EB', // gray-200
    paddingTop: 10,
  },
  status: {
    padding: '4 8',
    borderRadius: 12,
    fontSize: 10,
    textAlign: 'center',
    backgroundColor: '#FEF3C7', // yellow-100
    color: '#92400E', // yellow-800
  },
  statusDelivered: {
    backgroundColor: '#D1FAE5', // green-100
    color: '#065F46', // green-800
  },
  statusReceived: {
    backgroundColor: '#DBEAFE', // blue-100
    color: '#1E40AF', // blue-800
  }
});

const ParcelPDF = ({ parcel }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            src={logoImage}
            style={styles.logo}
          />
          <View style={styles.dateSection}>
            <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.subtitle}>Receipt #{parcel.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parcel Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Parcel ID:</Text>
          <Text style={styles.value}>{parcel.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created Date:</Text>
          <Text style={styles.value}>{new Date(parcel.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <View style={[
            styles.status,
            parcel.status === 'delivered' && styles.statusDelivered,
            parcel.status === 'received' && styles.statusReceived
          ]}>
            <Text>{parcel.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sender Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{parcel.senderName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{parcel.senderEmail}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receiver Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{parcel.receiverName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{parcel.receiverEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{parcel.receiverPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>{parcel.destination}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Weight:</Text>
          <Text style={styles.value}>{parcel.weight} kg</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle Type:</Text>
          <Text style={styles.value}>{parcel.vehicleType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{parcel.paymentMethod}</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.value}>${parcel.amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>HOT Courier Services</Text>
        <Text>123 Delivery Street, Harare, Zimbabwe</Text>
        <Text>Tel: +263 123 456 789 | Email: support@hot.co.zw</Text>
      </View>
    </Page>
  </Document>
);

const PrintReceipt = () => {
  const [parcel, setParcel] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const parcelId = searchParams.get('parcelId');

  useEffect(() => {
    if (parcelId) {
      // First try to get from temp storage (for admin view)
      const tempParcel = localStorage.getItem('temp_print_parcel');
      if (tempParcel) {
        const parsedParcel = JSON.parse(tempParcel);
        if (parsedParcel.id === parcelId) {
          setParcel(parsedParcel);
          localStorage.removeItem('temp_print_parcel'); // Clean up
          return;
        }
      }

      // If not in temp storage, get from parcels storage
      const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
      const foundParcel = parcels.find(p => p.id === parcelId);
      if (foundParcel) {
        setParcel(foundParcel);
      } else {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  }, [parcelId, navigate]);

  if (!parcel) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>
      <PDFViewer className="w-full h-full">
        <ParcelPDF parcel={parcel} />
      </PDFViewer>
    </div>
  );
};

export default PrintReceipt; 