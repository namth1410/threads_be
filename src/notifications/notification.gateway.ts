import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // Map userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.connectedUsers.set(Number(userId), client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries()).find(
      ([, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  sendNotificationToAll(message: string) {
    this.server.emit('notification', { message });
  }

  sendNotificationToUser(userId: number, message: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message });
    }
  }
}
