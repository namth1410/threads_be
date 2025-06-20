import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class UploadGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  notifyUploadComplete(threadId: number, fileUrl: string) {
    console.log(`[Socket] Emitting to thread ${threadId}:`, fileUrl); // ✅ log tại đây
    this.server.emit(`upload-complete-${threadId}`, { fileUrl });
  }

  notifyUploadFailed(threadId: number, reason: string) {
    console.log(`[Socket] ❌ Upload failed: thread ${threadId}`, reason);
    this.server.emit(`upload-failed-${threadId}`, { reason });
  }
}
