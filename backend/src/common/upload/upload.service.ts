import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"; // NestJS Config modulini import qiling
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { extname } from "path";

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')?.trim();
    const key = this.configService.get<string>('SUPABASE_KEY')?.trim();
    this.bucket = this.configService.get<string>('SUPABASE_BUCKET')?.trim() || '';

    if (!url || !key) {
        throw new Error("Supabase URL yoki KEY topilmadi! .env faylini tekshiring.");
    }
    if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) {
        throw new Error(`SUPABASE_URL noto'g'ri formatda: "${url}"`);
    }

    this.supabase = createClient(url, key);
    }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const unique = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`;
    
    // error ob'ektini to'liq ko'rish uchun log qo'shamiz
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(unique, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase xatolik tafsiloti:', error); // Haqiqiy sababni ko'rish uchun
      throw new Error(`Yuklashda xatolik: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(unique);

    return data.publicUrl;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.supabase.storage.from(this.bucket).remove([fileName]);
  }
}
