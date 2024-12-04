import { useState } from 'react';
import { KeyIcon, UserIcon } from '@heroicons/react/24/outline';

const Settings = ({ user }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);

    if (userIndex !== -1 && users[userIndex].password === formData.currentPassword) {
      users[userIndex].password = formData.newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: 'Current password is incorrect' });
    }
  };

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Settings</h3>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account settings and password
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {message.text && (
                  <div
                    className={`rounded-md p-4 ${
                      message.type === 'error' ? 'bg-red-50' : 'bg-green-50'
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.type === 'error' ? 'text-red-800' : 'text-green-800'
                      }`}
                    >
                      {message.text}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      disabled
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      value={formData.email}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, currentPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 