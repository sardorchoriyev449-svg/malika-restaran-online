import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users } from "../users/model/user.model";
import { Model } from "mongoose";
import bcrypt from 'bcrypt'
import type { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { UserRoles } from "../../common/guards/user-role.guard";
import { getAdminPassword, getAdminPhone } from "../../common/configs/admin.config";
import { getAccessTime, getAccessToken, getRefreshTime, getRefreshToken } from "../../common/configs/tokens.config";
import { RegisterDto } from "./dtos/register-dtos";
import { LoginDto } from "./dtos/login-dtos";
import { RedisService } from "../../common/redis/redis.service";
import { SmsService } from "../../common/sms/sms.service";


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users.name) private readonly method: Model<Users>,
        private readonly jwtService: JwtService,
        private readonly redis: RedisService,
        private readonly sms: SmsService,
    ) { }

    // Ro'yxatdan o'tishdan oldin telefon raqamga 6 xonali tasdiqlash kodi yuboradi.
    // Soxta/notog'ri raqamlar bilan ro'yxatdan o'tishning oldini oladi.
    async sendOtp(phone: string) {
        const fullPhone = `+998${phone}`;

        const existing = await this.method.findOne({ phone: fullPhone });
        if (existing) {
            return { success: false, message: `${phone} nomer allaqachon ro'yxatdan o'tgan` };
        }

        // Qayta-qayta SMS so'rashning oldini olish uchun 60 soniyalik "sovutish" vaqti
        const cooldownKey = `otp-cooldown:${fullPhone}`;
        const cooldown = await this.redis.get(cooldownKey);
        if (cooldown) {
            return { success: false, message: `Iltimos, ${cooldown} soniyadan so'ng qayta urinib ko'ring` };
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await this.redis.set(`otp:${fullPhone}`, code, 120); // 2 daqiqa amal qiladi
        await this.redis.set(cooldownKey, '60', 60);

        const sent = await this.sms.sendOtp(fullPhone, code);

        return {
            success: true,
            message: sent
                ? 'Tasdiqlash kodi SMS orqali yuborildi'
                : 'SMS xizmati sozlanmagan — kod konsolga chiqarildi (faqat dev muhitida)',
        };
    }

    async register(dto: RegisterDto, res: Response) {
        try {
            const admin = await this.method.findOne({ role: UserRoles.admin });
            if (!admin) await this.adminSeed();

            const phone = `+998${dto.phone}`;
            const user = await this.method.findOne({ phone:phone });

            if (user) {
                return {
                    success:false,
                    message:`${dto.phone} nomer ro\'yxatan o\'tgan`
                }
            }

            const savedCode = await this.redis.get(`otp:${phone}`);
            if (!savedCode || savedCode !== dto.otp_code) {
                return {
                    success: false,
                    message: `Tasdiqlash kodi noto'g'ri yoki muddati tugagan. Qaytadan kod so'rang.`,
                };
            }
            await this.redis.delete(`otp:${phone}`);

            const hassPass = await this.heshPass(dto.password);
            const newUser = await this.method.create({ ...dto, phone: phone, password: hassPass, role:UserRoles.client });

            const accessToken = await this.accessGenerateToken({ id: newUser._id, role: newUser.role });
            res.cookie('accessToken', accessToken, {
                signed: true,
                httpOnly: true,
                maxAge: 15 * 60 * 1000, 
            });

            const refreshToken = await this.refreshGenerateToken({ id: newUser._id, role: newUser.role });
            res.cookie('refreshToken', refreshToken, {
                signed: true,
                httpOnly: true,
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });

            return {
                success:true,
                message:`Ro\'yxatan Mufaqayatli O\'tildi`
            };

        } catch (error: any) {
            throw new Error(`Error: ${error?.message}`)
        }
    }

    async login(dto: LoginDto, res: Response) {

        const admin = await this.method.findOne({ role: UserRoles.admin })
        if (!admin) await this.adminSeed();

        const phone = `+998${dto.phone}`
        const user = await this.method.findOne({ phone: phone })

        if (!user) return {success:false, message:`Nomer ro\'yxatan o\'tmagan!`}

        const isSame = await this.compare(dto.password, user.password)

        if (!isSame) return {success:false, message:`Parol notogri..!`}

        const accessToken = await this.accessGenerateToken({ id: user._id, role: user.role });
        const refreshToken = await this.refreshGenerateToken({ id: user._id, role: user.role });
        res.cookie('accessToken', accessToken, {
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        return {
            success: true,
            message: `Muvaffaqiyatli kirildi`,
            data: {
                id: user._id,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role,
            },
        };
    }

    private async adminSeed() {
        const pass = getAdminPassword();
        const phone = getAdminPhone();

        if (!pass) {
            throw new Error("Kritik xato: SECRET_ADMIN_PASS topilmadi! .env faylini tekshiring.");
        }

        const heshPass = await this.heshPass(pass);
        await this.method.create({
            fullName: 'ADMIN',
            age: 20,
            phone: phone,
            password: heshPass,
            role: UserRoles.admin,
        });
    }
    async logout(res: Response) {
        res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'none' });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
        return;
    }
    async getMe(userId: string) {
        const user = await this.method.findById(userId).select('-password');
        if (!user) return { success:false, message: 'Foydalanuvchi topilmadi' };
        return { success:true, data: user };
    }
    async getAdminContact() {
        const admin = await this.method.findOne({ role: UserRoles.admin });
        if (!admin) return { success:false, message: 'Admin topilmadi' };
        return { success:true, phone: admin.phone };
    }
    private async heshPass(pass: string) {
        const hassPass = await bcrypt.hash(pass, 10)
        return hassPass
    }
    private async compare(orgPass: string, hashPass: string) {
        const isSame = await bcrypt.compare(orgPass, hashPass)
        return isSame
    }

    private async accessGenerateToken(payload: any): Promise<string> {
        const token = await this.jwtService.signAsync(payload, {
            secret: getAccessToken(),
            expiresIn: getAccessTime(),
        })
        return token
    }
    private async refreshGenerateToken(payload: any): Promise<string> {
        const token = await this.jwtService.signAsync(payload, {
            secret: getRefreshToken(),
            expiresIn: getRefreshTime() as any,
        })
        return token
    }

}