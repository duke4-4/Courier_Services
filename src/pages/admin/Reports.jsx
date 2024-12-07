import { useState, useEffect } from 'react';
import {
  DocumentChartBarIcon,
  CalendarIcon,
  MapPinIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [parcels, setParcels] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dateRange, setDateRange] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState({
    totalParcels: 0,
    deliveredParcels: 0,
    pendingParcels: 0,
    cityWiseData: {},
    revenueByCity: {},
    paymentStatus: {
      paid: 0,
      pending: 0
    }
  });

  const cities = ['Harare', 'Bulawayo', 'Gweru', 'Mutare'];

  useEffect(() => {
    loadData();
  }, [dateRange, customStartDate, customEndDate, selectedCity]);

  const loadData = () => {
    const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    let filteredParcels = allParcels;

    // Apply date filtering
    if (dateRange !== 'all') {
      const endDate = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
      }

      filteredParcels = allParcels.filter(parcel => {
        const parcelDate = new Date(parcel.createdAt);
        return parcelDate >= startDate && parcelDate <= endDate;
      });
    }

    // Apply city filtering
    if (selectedCity !== 'all') {
      filteredParcels = filteredParcels.filter(parcel => 
        parcel.dispatchBranch?.toLowerCase().includes(selectedCity.toLowerCase()) ||
        parcel.destinationBranch?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Calculate statistics
    const stats = {
      totalParcels: filteredParcels.length,
      deliveredParcels: filteredParcels.filter(p => p.status === 'delivered' || p.status === 'received').length,
      pendingParcels: filteredParcels.filter(p => p.status === 'pending' || p.status === 'in_transit').length,
      cityWiseData: {},
      revenueByCity: {},
      paymentStatus: {
        paid: filteredParcels.filter(p => p.isPaid).length,
        pending: filteredParcels.filter(p => !p.isPaid).length
      }
    };

    // Calculate city-wise data
    cities.forEach(city => {
      const cityParcels = filteredParcels.filter(parcel => 
        parcel.dispatchBranch?.toLowerCase().includes(city.toLowerCase()) ||
        parcel.destinationBranch?.toLowerCase().includes(city.toLowerCase())
      );

      stats.cityWiseData[city] = {
        total: cityParcels.length,
        delivered: cityParcels.filter(p => p.status === 'delivered' || p.status === 'received').length,
        pending: cityParcels.filter(p => p.status === 'pending' || p.status === 'in_transit').length,
      };

      stats.revenueByCity[city] = cityParcels.reduce((sum, parcel) => 
        sum + (parcel.isPaid ? parcel.totalAmount : 0), 0
      );
    });

    // Calculate total revenue
    const totalRev = filteredParcels.reduce((sum, parcel) => 
      sum + (parcel.isPaid ? parcel.totalAmount : 0), 0
    );

    setParcels(filteredParcels);
    setTotalRevenue(totalRev);
    setReportData(stats);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HOT Courier Services - Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #EA580C; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .summary { margin: 20px 0; padding: 15px; background: #f8f9fa; }
            .date-range { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>HOT Courier Services - Report</h1>
          <div class="date-range">
            ${dateRange === 'custom' 
              ? `Period: ${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
              : `Period: ${dateRange}`
            }
            ${selectedCity !== 'all' ? ` | City: ${selectedCity}` : ''}
          </div>

          <div class="summary">
            <h2>Summary</h2>
            <p>Total Parcels: ${reportData.totalParcels}</p>
            <p>Total Revenue: $${totalRevenue.toFixed(2)}</p>
            <p>Delivery Rate: ${reportData.totalParcels ? 
              ((reportData.deliveredParcels / reportData.totalParcels) * 100).toFixed(1) : 0}%</p>
          </div>

          <h2>City-wise Report</h2>
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Total Parcels</th>
                <th>Delivered</th>
                <th>Pending</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${cities.map(city => `
                <tr>
                  <td>${city}</td>
                  <td>${reportData.cityWiseData[city]?.total || 0}</td>
                  <td>${reportData.cityWiseData[city]?.delivered || 0}</td>
                  <td>${reportData.cityWiseData[city]?.pending || 0}</td>
                  <td>$${reportData.revenueByCity[city]?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto"
          >
            <PrinterIcon className="-ml-1 mr-2 h-5 w-5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Parcels</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.totalParcels}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Delivery Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reportData.totalParcels ? 
                      `${((reportData.deliveredParcels / reportData.totalParcels) * 100).toFixed(1)}%` 
                      : '0%'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City-wise Reports */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">City-wise Reports</h2>
        <div className="mt-4 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">City</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Parcels</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Delivered</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pending</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {cities.map(city => (
                      <tr key={city}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{city}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {reportData.cityWiseData[city]?.total || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {reportData.cityWiseData[city]?.delivered || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {reportData.cityWiseData[city]?.pending || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${reportData.revenueByCity[city]?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;