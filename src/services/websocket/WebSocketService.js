import { Server } from 'socket.io';
import { authService } from '../auth/authService.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connections = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await authService.verifyToken(token);
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.id}`);
      this.connections.set(socket.user.id, socket);

      // Join room based on user's branch
      if (socket.user.branchId) {
        socket.join(`branch-${socket.user.branchId}`);
      }

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
        this.connections.delete(socket.user.id);
      });
    });
  }

  notifyParcelUpdate(parcelData) {
    // Notify sender's branch
    this.io.to(`branch-${parcelData.senderBranchId}`).emit('parcel-update', {
      type: 'PARCEL_UPDATED',
      data: parcelData
    });

    // Notify destination branch
    this.io.to(`branch-${parcelData.destinationBranchId}`).emit('parcel-update', {
      type: 'PARCEL_UPDATED',
      data: parcelData
    });
  }

  notifyStatusUpdate(parcelData) {
    this.io.emit('status-update', {
      type: 'STATUS_UPDATED',
      data: parcelData
    });
  }
}

export const webSocket = new WebSocketService(); 