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
      branchId: 'BR001',
      branchName: 'Harare Central'
    },
    {
      id: 'op-2',
      email: 'bulawayo.main@hot.co.zw',
      password: 'operator123',
      name: 'Bulawayo Main Operator',
      role: 'operator',
      branchId: 'BR002',
      branchName: 'Bulawayo Main'
    },
    {
      id: 'op-3',
      email: 'gweru@hot.co.zw',
      password: 'operator123',
      name: 'Gweru Branch Operator',
      role: 'operator',
      branchId: 'BR003',
      branchName: 'Gweru Branch'
    },
    {
      id: 'op-4',
      email: 'mutare@hot.co.zw',
      password: 'operator123',
      name: 'Mutare Branch Operator',
      role: 'operator',
      branchId: 'BR004',
      branchName: 'Mutare Branch'
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
        senderName: 'Harare Central Operator',
        senderEmail: 'harare.central@hot.co.zw',
        senderBranchId: 'BR001',
        dispatchBranch: 'Harare Central',
        dispatchAddress: 'Harare CBD',
        receiverName: 'John Doe',
        receiverEmail: 'john@example.com',
        receiverPhone: '+263 77 123 4567',
        destinationBranch: 'Bulawayo Main',
        destinationBranchId: 'BR002',
        description: 'Electronics package',
        weight: 5,
        vehicleType: 'van',
        paymentMethod: 'prepaid',
        status: 'in_transit',
        amount: 50,
        floatAmount: 0,
        totalAmount: 50,
        isPaid: true,
        paidAt: new Date().toISOString(),
        paidBy: 'harare.central@hot.co.zw',
        createdAt: new Date().toISOString(),
        statusUpdates: [
          {
            status: 'pending',
            updatedAt: new Date().toISOString(),
            updatedBy: 'harare.central@hot.co.zw',
            branchId: 'BR001',
            branchName: 'Harare Central'
          }
        ]
      },
    ];
    localStorage.setItem('parcels', JSON.stringify(parcels));
  }

  // Verify initialization
  console.log('Data initialization complete. Users:', JSON.parse(localStorage.getItem('users')));
}; 