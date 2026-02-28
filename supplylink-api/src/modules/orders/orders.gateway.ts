import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/orders' })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-order')
  handleJoin(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
  }

  emitStatusUpdate(orderId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('status-updated', { orderId, status });
  }
}
