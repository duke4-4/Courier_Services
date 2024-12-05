import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartPieIcon, 
  TruckIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Overview = () => {
  const [stats, setStats] = useState({
    totalParcels: 0,
    activeParcels: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: []
  });

  const [vehicles, setVehicles] = useState({
    active: [
      { id: 'V001', driver: 'John Doe', destination: 'Harare CBD', eta: '14:30', status: 'On Route' },
      { id: 'V002', driver: 'Jane Smith', destination: 'Bulawayo', eta: '16:45', status: 'On Route' },
      { id: 'V003', driver: 'Mike Johnson', destination: 'Mutare', eta: '15:15', status: 'Loading' }
    ],
    idle: [
      { id: 'V004', driver: 'Sarah Wilson', lastLocation: 'Gweru Depot', since: '10:00' },
      { id: 'V005', driver: 'Tom Brown', lastLocation: 'Harare Depot', since: '11:30' }
    ]
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [lastParcelCount, setLastParcelCount] = useState(0);

  const loadData = async () => {
    setIsRefreshing(true);
    
    try {
      // Get all parcels
      const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if there are new parcels
      if (parcels.length > lastParcelCount) {
        // Add notification for new parcels
        const newParcelsCount = parcels.length - lastParcelCount;
        const notification = {
          id: `notif-${Date.now()}`,
          userId: 'admin@hot.co.zw',
          title: 'New Parcels',
          message: `${newParcelsCount} new parcel${newParcelsCount > 1 ? 's' : ''} received`,
          createdAt: new Date().toISOString(),
        };
        
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
      }
      
      // Update last parcel count
      setLastParcelCount(parcels.length);
      
      // Calculate stats
      const totalRevenue = parcels.reduce((acc, curr) => acc + curr.amount, 0);
      const activeParcels = parcels.filter(p => p.status !== 'delivered').length;
      
      // Update stats
      setStats({
        totalParcels: parcels.length,
        activeParcels: activeParcels,
        totalRevenue: totalRevenue,
        totalUsers: users.length,
      });

      // Generate monthly data for the graph
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const last6Months = months.slice(currentMonth - 5, currentMonth + 1);

      // Group parcels by month
      const monthlyParcels = parcels.reduce((acc, parcel) => {
        const month = new Date(parcel.createdAt).getMonth();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthlyRevenue = parcels.reduce((acc, parcel) => {
        const month = new Date(parcel.createdAt).getMonth();
        acc[month] = (acc[month] || 0) + parcel.amount;
        return acc;
      }, {});

      setMonthlyData({
        labels: last6Months,
        datasets: [
          {
            label: 'Revenue ($)',
            data: last6Months.map((_, index) => {
              const monthIndex = (currentMonth - 5 + index + 12) % 12;
              return monthlyRevenue[monthIndex] || 0;
            }),
            borderColor: 'rgb(234, 88, 12)',
            tension: 0.1
          },
          {
            label: 'Deliveries',
            data: last6Months.map((_, index) => {
              const monthIndex = (currentMonth - 5 + index + 12) % 12;
              return monthlyParcels[monthIndex] || 0;
            }),
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1
          }
        ]
      });

      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [lastParcelCount]); // Added lastParcelCount as dependency

  const cards = [
    { name: 'Total Parcels', value: stats.totalParcels, icon: ArchiveBoxIcon },
    { name: 'Active Deliveries', value: stats.activeParcels, icon: TruckIcon },
    { name: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: CurrencyDollarIcon },
    { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon },
  ];

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none flex space-x-4">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className={`inline-flex items-center justify-center rounded-md border border-transparent ${
              isRefreshing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            } px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto`}
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Link to="/admin/reports">
            <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto">
              <DocumentChartBarIcon className="-ml-1 mr-2 h-5 w-5" />
              View Reports
            </button>
          </Link>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <card.icon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Status Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Vehicles */}
        <div>
          <h2 className="text-lg font-medium text-gray-900">Active Vehicles</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {vehicles.active.map((vehicle) => (
                <li key={vehicle.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{vehicle.driver}</p>
                      <p className="text-sm text-gray-500">Vehicle ID: {vehicle.id}</p>
                      <p className="text-sm text-gray-500">To: {vehicle.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">{vehicle.status}</p>
                      <p className="text-sm text-gray-500">ETA: {vehicle.eta}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Idle Vehicles */}
        <div>
          <h2 className="text-lg font-medium text-gray-900">Idle Vehicles</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {vehicles.idle.map((vehicle) => (
                <li key={vehicle.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{vehicle.driver}</p>
                      <p className="text-sm text-gray-500">Vehicle ID: {vehicle.id}</p>
                      <p className="text-sm text-gray-500">Last Location: {vehicle.lastLocation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Idle since: {vehicle.since}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Company Performance Graph */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Company Performance</h2>
        <div className="mt-4 bg-white p-6 shadow sm:rounded-lg">
          <Line 
            data={monthlyData}
            options={{
              responsive: true,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Recent Parcels Table */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Parcels</h2>
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parcel ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Add sample data or real data here */}
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

export default Overview;