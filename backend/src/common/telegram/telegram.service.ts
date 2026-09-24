import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly token = process.env.TELEGRAM_BOT_TOKEN;
    private readonly chatId = process.env.TELEGRAM_CHAT_ID;

    async sendOrderNotification(order: any) {
        if (!this.token || !this.chatId) {
            this.logger.warn('TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan — xabarnoma yuborilmadi.');
            return;
        }

        const itemsText = (order.items || [])
            .map((i: any) => `• ${i.title} × ${i.qty} — ${(i.price * i.qty).toLocaleString('uz-UZ')} so'm`)
            .join('\n');

        const customerName = order.user_id?.name || 'Noma\'lum';
        const customerPhone = order.user_id?.phone || '-';
        const mapLink = order.address?.lat && order.address?.lng
            ? `https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`
            : null;

        const text =
            `🍕 <b>Yangi buyurtma tushdi!</b>\n\n` +
            `👤 <b>${this.escape(customerName)}</b>\n` +
            `📞 ${this.escape(customerPhone)}\n` +
            `📍 <b>${this.escape(order.address?.label || '')}:</b> ${this.escape(order.address?.address_text || '')}\n` +
            (mapLink ? `🗺 <a href="${mapLink}">Xaritada ko'rish</a>\n` : '') +
            `\n<b>Mahsulotlar:</b>\n${this.escape(itemsText)}\n\n` +
            `💰 <b>Jami: ${Number(order.total).toLocaleString('uz-UZ')} so'm</b>`;

        try {
            const res = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                }),
            });
            if (!res.ok) {
                const body = await res.text();
                this.logger.error(`Telegram xabarnoma yuborilmadi: ${res.status} ${body}`);
            }
        } catch (err) {
            this.logger.error('Telegram xabarnoma yuborishda xato', err as Error);
        }
    }

    private escape(text: string) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}