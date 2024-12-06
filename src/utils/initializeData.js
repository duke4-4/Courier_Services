export const initializeData = () => {
  // Clear any existing data when in development
  if (import.meta.env.DEV) {
    console.log('Development mode: Resetting local storage data');
    localStorage.clear();
  }

  // Initialize branches
  const branches = [
    { id: 'BR001', name: 'Harare Central', location: 'Harare CBD' },
    { id: 'BR002', name: 'Bulawayo Main', location: 'Bulawayo CBD' },
    { id: 'BR003', name: 'Gweru Branch', location: 'Gweru' },
    { id: 'BR004', name: 'Mutare Branch', location: 'Mutare' }
  ];
  localStorage.setItem('branches', JSON.stringify(branches));

  // Initialize users with operators
  const users = [
    {
      id: 'admin-1',
      email: 'admin@hot.co.zw',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User'
    },
    {
      id: 'op-1',
      email: 'harare.central@hot.co.zw',
      password: 'operator123',
      name: 'Harare Central Operator',
      role: 'operator',
      branchId: 'BR001'
    },
    {
      id: 'op-2',
      email: 'bulawayo.main@hot.co.zw',
      password: 'operator123',
      name: 'Bulawayo Main Operator',
      role: 'operator',
      branchId: 'BR002'
    },
    {
      id: 'receiver-1',
      email: 'receiver@hot.co.zw',
      password: 'receiver123',
      role: 'receiver',
      name: 'Receiver User'
    },
  ];
  localStorage.setItem('users', JSON.stringify(users));

  // Initialize other data only if it doesn't exist
  if (!localStorage.getItem('notifications')) {
    const notifications = [
      {
        id: 'notif1',
        userId: 'admin-1',
        title: 'New Parcel Created',
        message: 'A new parcel has been created and is pending approval.',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  if (!localStorage.getItem('parcels')) {
    const parcels = [
      {
        id: 'PCL1001',
        sender: 'sender@hot.co.zw',
        receiver: 'John Doe',
        description: 'Electronics package',
        dispatchCity: 'harare',
        destinationCity: 'bulawayo',
        vehicleType: 'van',
        paymentType: 'prepaid',
        status: 'in_transit',
        amount: 50,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('parcels', JSON.stringify(parcels));
  }

  // Verify initialization
  console.log('Data initialization complete. Users:', JSON.parse(localStorage.getItem('users')));
}; 