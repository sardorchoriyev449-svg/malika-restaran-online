import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
        credentials: true,
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    // Har bir yangi xabar shu event orqali hammaga yuboriladi;
    // frontend `userId`ga qarab kerakli suhbatga tegishli ekanini tekshiradi.
    emitNewMessage(message: any) {
        this.server.emit('new-message', message);
    }
}
