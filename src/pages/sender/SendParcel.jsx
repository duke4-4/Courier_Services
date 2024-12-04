const SendParcel = ({ user }) => {
  const [formData, setFormData] = useState({
    senderName: user?.name || '',
    senderEmail: user?.email || '',
    receiverName: '',
    receiverEmail: '',
    description: '',
    dispatchCity: '',
    destinationCity: '',
    vehicleType: 'van',
    paymentType: 'prepaid',
    amount: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const newParcel = {
      id: `PCL${Date.now().toString().slice(-6)}`,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    parcels.push(newParcel);
    localStorage.setItem('parcels', JSON.stringify(parcels));
    // Reset form or redirect
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Sender Details</h3>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Sender Name</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Sender Email</label>
                <input
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 md:gap-6 mt-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Receiver Details</h3>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Receiver Name</label>
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Receiver Email</label>
                <input
                  type="email"
                  value={formData.receiverEmail}
                  onChange={(e) => setFormData({...formData, receiverEmail: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your existing form fields */}
      </div>
    </form>
  );
}; 