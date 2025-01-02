export const branches = [
  { id: 'BR001', name: 'Harare Central', location: 'Harare CBD' },
  { id: 'BR002', name: 'Bulawayo Main', location: 'Bulawayo CBD' },
  { id: 'BR003', name: 'Gweru Branch', location: 'Gweru' },
  { id: 'BR004', name: 'Mutare Branch', location: 'Mutare' }
];

export const users = [
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
  }
];


export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

export const findBranchById = (branchId) => {
  return branches.find(branch => branch.id === branchId);
};

export const getBranchOperator = (branchId) => {
  return users.find(user => user.role === 'operator' && user.branchId === branchId);
};

export const getAllBranches = () => {
  return branches;
}; 