import { Injectable, Logger } from "@nestjs/common";

const ESKIZ_BASE_URL = "https://notify.eskiz.uz/api";

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private token: string | null = null;

    private get credentialsConfigured(): boolean {
        return !!(process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD);
    }

    private async login(): Promise<string | null> {
        if (!this.credentialsConfigured) return null;
        try {
            const res = await fetch(`${ESKIZ_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: process.env.ESKIZ_EMAIL,
                    password: process.env.ESKIZ_PASSWORD,
                }),
            });
            const data = await res.json();
            this.token = data?.data?.token ?? null;
            return this.token;
        } catch (err) {
            this.logger.error(`Eskiz.uz'ga kirib bo'lmadi: ${err}`);
            return null;
        }
    }

    /**
     * SMS yuboradi. Eskiz.uz ma'lumotlari (.env'da ESKIZ_EMAIL/ESKIZ_PASSWORD)
     * sozlanmagan bo'lsa, xato bermaydi — shunchaki konsolga chiqarib qo'yadi
     * (lokal test qilish uchun qulay).
     */
    async send(phone: string, message: string): Promise<boolean> {
        if (!this.credentialsConfigured) {
            this.logger.warn(
                `ESKIZ_EMAIL/ESKIZ_PASSWORD sozlanmagan — SMS yuborilmadi, faqat konsolga chiqarildi: [${phone}] ${message}`,
            );
            return false;
        }

        const token = this.token ?? (await this.login());
        if (!token) return false;

        const attemptSend = async (authToken: string) => {
            return fetch(`${ESKIZ_BASE_URL}/message/sms/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    mobile_phone: phone.replace(/\D/g, ""),
                    message,
                    from: process.env.ESKIZ_FROM ?? "4546",
                }),
            });
        };

        try {
            let res = await attemptSend(token);
            if (res.status === 401) {
                // Token eskirgan bo'lishi mumkin — qayta login qilib, bir marta qayta urinamiz
                const freshToken = await this.login();
                if (!freshToken) return false;
                res = await attemptSend(freshToken);
            }
            return res.ok;
        } catch (err) {
            this.logger.error(`SMS yuborishda xatolik: ${err}`);
            return false;
        }
    }

    async sendOtp(phone: string, code: string): Promise<boolean> {
        return this.send(phone, `Malika Restoran: tasdiqlash kodingiz — ${code}`);
    }
}
