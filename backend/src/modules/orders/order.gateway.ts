import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
        credentials: true,
    },
})
export class OrderGateway {
    @WebSocketServer()
    server: Server;

    emitNewOrder(order: any) {
        this.server.emit('new-order', order);
    }

    // Mijoz stol bilan buyurtma berganda — admin "Bron" sahifasi shu eventni tinglaydi
    emitNewReservationRequest(order: any) {
        this.server.emit('new-reservation-request', order);
    }

    emitReservationDecided(order: any) {
        this.server.emit('reservation-decided', order);
    }

    emitOrderCancelled(orderId: string) {
        this.server.emit('order-cancelled', orderId);
    }

    emitOrderStatusChanged(orderId: string, status: string) {
        this.server.emit('order-status-changed', { orderId, status });
    }
}
