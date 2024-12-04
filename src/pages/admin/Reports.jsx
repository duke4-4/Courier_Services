import { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon as DocumentDownloadIcon,
} from '@heroicons/react/24/outline';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

// Register a font for PDF
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#374151',
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  summaryBox: {
    backgroundColor: '#f9fafb',
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});

const ReportDocument = ({ reports, companyBalance, totalRevenue }) => {
  const pendingAmount = reports.reduce((acc, curr) => 
    curr.status !== 'delivered' ? acc + curr.amount : acc, 0
  );
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Financial Report</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Revenue:</Text>
              <Text style={styles.summaryValue}>${totalRevenue}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Company Balance:</Text>
              <Text style={styles.summaryValue}>${companyBalance}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pending Payments:</Text>
              <Text style={styles.summaryValue}>${pendingAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Balance:</Text>
              <Text style={styles.summaryValue}>${companyBalance - pendingAmount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>ID</Text>
              <Text style={styles.tableCell}>Sender</Text>
              <Text style={styles.tableCell}>Status</Text>
              <Text style={styles.tableCell}>Amount</Text>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            {reports.map((report) => (
              <View key={report.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{report.id}</Text>
                <Text style={styles.tableCell}>{report.sender}</Text>
                <Text style={styles.tableCell}>{report.status}</Text>
                <Text style={styles.tableCell}>${report.amount}</Text>
                <Text style={styles.tableCell}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

ReportDocument.propTypes = {
  reports: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    sender: PropTypes.string,
    status: PropTypes.string,
    amount: PropTypes.number,
    createdAt: PropTypes.string,
  })).isRequired,
  companyBalance: PropTypes.number.isRequired,
  totalRevenue: PropTypes.number.isRequired,
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filterCity, setFilterCity] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [companyBalance, setCompanyBalance] = useState(0);

  useEffect(() => {
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    setReports(parcels);
    // In a real app, this would come from an API
    setCompanyBalance(150000); // Example company balance
  }, []);

  const filteredReports = reports.filter(report => {
    let matchesCity = filterCity === 'all' || report.dispatchCity?.toLowerCase() === filterCity;
    let matchesDate = true;

    if (filterDate !== 'all') {
      const reportDate = new Date(report.createdAt);
      const today = new Date();

      switch(filterDate) {
        case 'daily':
          matchesDate = reportDate.toDateString() === today.toDateString();
          break;
        case 'weekly': {
          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= lastWeek;
          break;
        }
        case 'monthly':
          matchesDate = reportDate.getMonth() === today.getMonth() && 
                       reportDate.getFullYear() === today.getFullYear();
          break;
        case 'custom': {
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          matchesDate = reportDate >= start && reportDate <= end;
          break;
        }
        default:
          break;
      }
    }

    return matchesCity && matchesDate;
  });

  const totalRevenue = filteredReports.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = filteredReports.reduce((acc, curr) => 
    curr.status !== 'delivered' ? acc + curr.amount : acc, 0
  );

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <PDFDownloadLink 
            document={
              <ReportDocument 
                reports={filteredReports} 
                companyBalance={companyBalance}
                totalRevenue={totalRevenue}
              />
            }
            fileName="financial-report.pdf"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto"
          >
            {({ loading }) => (
              <>
                <DocumentDownloadIcon className="-ml-1 mr-2 h-5 w-5" />
                {loading ? 'Generating...' : 'Download Report'}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="all">All Cities</option>
                <option value="harare">Harare</option>
                <option value="bulawayo">Bulawayo</option>
                <option value="gweru">Gweru</option>
                <option value="mutare">Mutare</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {filterDate === 'custom' && (
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Custom Date Range</label>
                <div className="mt-1 flex space-x-4">
                  <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                  <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${totalRevenue}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Company Balance</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${companyBalance}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${pendingAmount}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Net Balance</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${companyBalance - pendingAmount}</dd>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.sender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.receiver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;