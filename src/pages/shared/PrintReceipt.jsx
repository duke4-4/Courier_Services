import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 10,
    color: '#666',
  },
  value: {
    flex: 2,
    fontSize: 10,
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    borderTopStyle: 'solid',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

const ParcelPDF = ({ parcel }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>HOT Courier Services</Text>
        <Text style={styles.subtitle}>Parcel Receipt</Text>
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
          <Text style={styles.value}>{parcel.status}</Text>
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
        <Text>Thank you for choosing HOT Courier Services</Text>
        <Text>For any queries, please contact support@hot.co.zw</Text>
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