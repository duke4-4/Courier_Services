import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
   
    const userNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      .filter(n => n.userId === user.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setNotifications(userNotifications);
  }, [user.email]);

  const handleDismiss = (notificationId) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = allNotifications.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        </div>
      </div>

      <div className="mt-8">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <li className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <BellIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                </div>
              </li>
            ) : (
              notifications.map((notification) => (
                <li key={notification.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <BellIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDismiss(notification.id)}
                        className="inline-flex items-center py-2 px-3 border border-transparent rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 