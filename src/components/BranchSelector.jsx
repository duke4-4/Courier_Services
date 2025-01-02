import { getAllBranches } from '../config/branchData';

function BranchSelector() {
  const branches = getAllBranches();
  
  return (
    <select>
      {branches.map(branch => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
} 