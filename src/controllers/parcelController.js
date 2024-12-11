import { parcelDb } from '../services/db/parcels.js';
import { webSocket } from '../services/websocket/WebSocketService.js';

export const createParcel = async (req, res) => {
  try {
    const parcelData = {
      ...req.body,
      senderBranchId: req.user.branchId,
      senderBranchName: req.user.branchName,
      createdBy: req.user.id
    };

    const newParcel = await parcelDb.create(parcelData);

    // Notify relevant parties via WebSocket
    webSocket.notifyParcelUpdate(newParcel);

    res.status(201).json({
      status: 'success',
      data: newParcel
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getParcels = async (req, res) => {
  try {
    let query = {};
    
    // Filter by branch for operators
    if (req.user.role === 'operator') {
      query = {
        $or: [
          { senderBranchId: req.user.branchId },
          { destinationBranchId: req.user.branchId }
        ]
      };
    }

    const parcels = await parcelDb.findAll(query);
    
    res.json({
      status: 'success',
      data: parcels
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getParcel = async (req, res) => {
  try {
    const parcel = await parcelDb.findById(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({
        status: 'error',
        message: 'Parcel not found'
      });
    }

    res.json({
      status: 'success',
      data: parcel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateParcelStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const statusData = {
      status,
      note,
      updatedBy: req.user.id,
      branchId: req.user.branchId,
      branchName: req.user.branchName
    };

    const updatedParcel = await parcelDb.updateStatus(req.params.id, statusData);

    // Notify via WebSocket
    webSocket.notifyStatusUpdate(updatedParcel);

    res.json({
      status: 'success',
      data: updatedParcel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const trackParcel = async (req, res) => {
  try {
    const parcel = await parcelDb.findByTrackingNumber(req.params.trackingNumber);
    
    if (!parcel) {
      return res.status(404).json({
        status: 'error',
        message: 'Parcel not found'
      });
    }

    res.json({
      status: 'success',
      data: parcel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add additional functions for parcel management
export const updateParcel = async (req, res) => {
  try {
    const updatedParcel = await parcelDb.update(req.params.id, req.body);
    
    webSocket.notifyParcelUpdate(updatedParcel);

    res.json({
      status: 'success',
      data: updatedParcel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteParcel = async (req, res) => {
  try {
    await parcelDb.delete(req.params.id);
    
    res.json({
      status: 'success',
      message: 'Parcel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 