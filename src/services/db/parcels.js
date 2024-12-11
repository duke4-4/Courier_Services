import { query, getConnection } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const parcelDb = {
  create: async (parcelData) => {
    const id = uuidv4();
    const trackingNumber = generateTrackingNumber();
    
    const sql = `
      INSERT INTO parcels (
        id, tracking_number, sender_name, sender_email, sender_branch_id,
        dispatch_branch, dispatch_address, receiver_name, receiver_email,
        receiver_phone, destination_branch, destination_branch_id,
        description, weight, vehicle_type, payment_method, amount,
        total_amount, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id,
      trackingNumber,
      parcelData.senderName,
      parcelData.senderEmail,
      parcelData.senderBranchId,
      parcelData.dispatchBranch,
      parcelData.dispatchAddress,
      parcelData.receiverName,
      parcelData.receiverEmail,
      parcelData.receiverPhone,
      parcelData.destinationBranch,
      parcelData.destinationBranchId,
      parcelData.description,
      parcelData.weight,
      parcelData.vehicleType,
      parcelData.paymentMethod,
      parcelData.amount,
      parcelData.totalAmount,
      parcelData.createdBy
    ]);

    return { ...parcelData, id, trackingNumber };
  },

  findAll: async (filters = {}) => {
    let sql = 'SELECT * FROM parcels';
    const params = [];

    if (filters.$or) {
      sql += ' WHERE sender_branch_id = ? OR destination_branch_id = ?';
      params.push(filters.$or[0].senderBranchId, filters.$or[1].destinationBranchId);
    }

    sql += ' ORDER BY created_at DESC';
    
    return await query(sql, params);
  },

  findById: async (id) => {
    const sql = `
      SELECT p.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'status', su.status,
                 'note', su.note,
                 'updatedBy', su.updated_by,
                 'branchId', su.branch_id,
                 'branchName', su.branch_name,
                 'createdAt', su.created_at
               )
             ) as status_updates
      FROM parcels p
      LEFT JOIN status_updates su ON p.id = su.parcel_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    
    const parcels = await query(sql, [id]);
    return parcels[0];
  },

  findByTrackingNumber: async (trackingNumber) => {
    const sql = `
      SELECT p.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'status', su.status,
                 'note', su.note,
                 'updatedBy', su.updated_by,
                 'branchId', su.branch_id,
                 'branchName', su.branch_name,
                 'createdAt', su.created_at
               )
             ) as status_updates
      FROM parcels p
      LEFT JOIN status_updates su ON p.id = su.parcel_id
      WHERE p.tracking_number = ?
      GROUP BY p.id
    `;
    
    const parcels = await query(sql, [trackingNumber]);
    return parcels[0];
  },

  // ... rest of your existing methods ...
};

function generateTrackingNumber() {
  const prefix = 'PCL';
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${random}`;
} 