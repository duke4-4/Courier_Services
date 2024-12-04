import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftIcon, TruckIcon, CreditCardIcon, ClockIcon } from '@heroicons/react/24/outline';

const NewParcel = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    receiverName: '',
    description: '',
    dispatchCity: '',
    destinationCity: '', 
    vehicleType: '',
    paymentType: 'prepaid',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate unique parcel ID
    const parcelId = `PCL${Date.now()}`;
    
    // Create new parcel object
    const newParcel = {
      id: parcelId,
      sender: user.email,
      receiver: formData.receiverName,
      description: formData.description,
      dispatchCity: formData.dispatchCity,
      destinationCity: formData.destinationCity,
      vehicleType: formData.vehicleType,
      paymentType: formData.paymentType,
      status: 'pending',
      amount: 50, // Example fixed amount
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    parcels.push(newParcel);
    localStorage.setItem('parcels', JSON.stringify(parcels));

    // Redirect to my parcels page
    navigate('/sender/parcels');
  };

  const tips = [
    {
      icon: TruckIcon,
      title: "Fast Delivery",
      description: "Same day delivery available for local routes"
    },
    {
      icon: CreditCardIcon, 
      title: "Flexible Payment",
      description: "Choose between prepaid or pay on delivery"
    },
    {
      icon: ClockIcon,
      title: "Real-time Tracking",
      description: "Track your parcel status in real-time"
    }
  ];

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tips Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          {tips.map((tip, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <tip.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{tip.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{tip.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1 bg-orange-50 p-8">
              <h3 className="text-2xl font-bold text-gray-900">New Parcel</h3>
              <p className="mt-4 text-gray-600">
                Please fill in the details for your new parcel delivery. We ensure safe and timely delivery of your packages.
              </p>
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900">Need Help?</h4>
                <p className="mt-2 text-gray-600">Our support team is available 24/7 to assist you with any queries.</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Receiver Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 focus:ring-orange-500 focus:border-orange-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg"
                      value={formData.receiverName}
                      onChange={(e) =>
                        setFormData({ ...formData, receiverName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="mt-1 focus:ring-orange-500 focus:border-orange-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Dispatch City
                      </label>
                      <select
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={formData.dispatchCity}
                        onChange={(e) =>
                          setFormData({ ...formData, dispatchCity: e.target.value })
                        }
                      >
                        <option value="">Select City</option>
                        <option value="harare">Harare</option>
                        <option value="bulawayo">Bulawayo</option>
                        <option value="gweru">Gweru</option>
                        <option value="mutare">Mutare</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Destination City
                      </label>
                      <select
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={formData.destinationCity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destinationCity: e.target.value,
                          })
                        }
                      >
                        <option value="">Select City</option>
                        <option value="harare">Harare</option>
                        <option value="bulawayo">Bulawayo</option>
                        <option value="gweru">Gweru</option>
                        <option value="mutare">Mutare</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Vehicle Type
                    </label>
                    <select
                      required
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      value={formData.vehicleType}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleType: e.target.value })
                      }
                    >
                      <option value="">Select Vehicle</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Payment Type
                    </label>
                    <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-10">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment-type"
                          value="prepaid"
                          checked={formData.paymentType === 'prepaid'}
                          onChange={(e) =>
                            setFormData({ ...formData, paymentType: e.target.value })
                          }
                          className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-700">
                          Prepaid
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment-type"
                          value="pay-on-delivery"
                          checked={formData.paymentType === 'pay-on-delivery'}
                          onChange={(e) =>
                            setFormData({ ...formData, paymentType: e.target.value })
                          }
                          className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-700">
                          Pay on Delivery
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Create Parcel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Widget */}
      <div className="fixed bottom-8 right-8">
        <button className="bg-orange-600 p-4 text-white rounded-full shadow-lg hover:bg-orange-700 transition-colors duration-200">
          <ChatBubbleLeftIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default NewParcel;