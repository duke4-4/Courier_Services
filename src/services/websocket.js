import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connections = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.connections.set(socket.userId, socket);

      // Join room based on user's branch
      if (socket.user?.branchId) {
        socket.join(`branch-${socket.user.branchId}`);
      }

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connections.delete(socket.userId);
      });
    });
  }

  emitToUser(userId, event, data) {
    const userSocket = this.connections.get(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  emitToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  notifyParcelUpdate(parcelData) {
    // Notify sender's branch
    if (parcelData.senderBranchId) {
      this.io.to(`branch-${parcelData.senderBranchId}`).emit('parcel-update', {
        type: 'PARCEL_UPDATED',
        data: parcelData
      });
    }

    // Notify destination branch
    if (parcelData.destinationBranchId) {
      this.io.to(`branch-${parcelData.destinationBranchId}`).emit('parcel-update', {
        type: 'PARCEL_UPDATED',
        data: parcelData
      });
    }
  }

  notifyStatusUpdate(parcelData) {
    this.io.emit('status-update', {
      type: 'STATUS_UPDATED',
      data: parcelData
    });
  }
}

// Create and export a single instance
export const webSocket = new WebSocketService(); 