const Kavenegar = require('kavenegar');

interface KavenegarResponse {
  return: {
    status: number;
    message: string;
  };
  entries?: Array<{
    messageid: number;
    message: string;
    status: number;
    statustext: string;
    sender: string;
    receptor: string;
    date: number;
    cost: number;
  }>;
}

interface KavenegarSendParams {
  message: string;
  sender?: string;
  receptor: string;
  date?: number;
  type?: number;
  localid?: number;
}

class SMSService {
  private api: any; // KavenegarApi instance
  private defaultSender: string;
  private apiKey: string;

  constructor() {
    // راه‌حل موقت: کلید مستقیم در کد
    this.apiKey = process.env.KAVENEGAR_API_KEY || '4B434F71444C3776523452336A36494D6A314C444C36704B735935376E4A78336B354D58655A7A686B4F673D';
    this.defaultSender = process.env.KAVENEGAR_SENDER || '2000660110';
    
    console.log('🔍 SMS Service Constructor:');
    console.log('API Key from env:', process.env.KAVENEGAR_API_KEY ? 'EXISTS' : 'MISSING');
    console.log('API Key used:', this.apiKey ? 'SET' : 'MISSING');
    
    if (!this.apiKey) {
      console.warn('KAVENEGAR_API_KEY not found in environment variables');
      return;
    }
    
    this.api = Kavenegar.KavenegarApi({
      apikey: this.apiKey
    });
    
    console.log('✅ SMS Service initialized successfully');
  }

  // ارسال پیامک ساده
  async sendSMS(receptor: string, message: string, sender?: string): Promise<boolean> {
    try {
      if (!this.apiKey || !this.api) {
        console.error('SMS Service not configured: Missing KAVENEGAR_API_KEY');
        return false;
      }

      const formattedReceptor = this.formatPhoneNumber(receptor);
      const senderNumber = sender || this.defaultSender;

      return new Promise((resolve) => {
        this.api.Send({
          message,
          sender: senderNumber,
          receptor: formattedReceptor
        }, function(response: any, status: number) {
          if (status === 200 && response && response[0] && response[0].status >= 1) {
            console.log('SMS sent successfully:', response);
            resolve(true);
          } else {
            console.error('Failed to send SMS:', response);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // فرمت کردن شماره تلفن
  formatPhoneNumber(phoneNumber: string): string {
    // حذف کد کشور +98 و تبدیل به فرمت 09
    return phoneNumber.replace(/^\+98|^98/, '0');
  }

  // ارسال کد تایید برای شماره تلفن
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `کد تایید شما: ${code}\nاین کد 5 دقیقه اعتبار دارد.\nبریس - تجهیزات پزشکی`;
    return this.sendSMS(phoneNumber, message);
  }

  // ارسال کد بازیابی رمز عبور
  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `کد بازیابی رمز عبور: ${code}\nاین کد 10 دقیقه اعتبار دارد.\nبریس - تجهیزات پزشکی`;
    return this.sendSMS(phoneNumber, message);
  }

  // ارسال پیامک خوش‌آمدگویی
  async sendWelcomeMessage(phoneNumber: string, name: string): Promise<boolean> {
    const message = `${name} عزیز، خوش آمدید!\nثبت نام شما در بریس با موفقیت انجام شد.\nبریس - تجهیزات پزشکی`;
    return this.sendSMS(phoneNumber, message);
  }

  // ارسال اطلاع‌رسانی تایید سفارش
  async sendOrderConfirmation(phoneNumber: string, orderNumber: string): Promise<boolean> {
    const message = `سفارش شما با کد ${orderNumber} ثبت شد.\nوضعیت سفارش را از پنل کاربری پیگیری کنید.\nبریس - تجهیزات پزشکی`;
    return this.sendSMS(phoneNumber, message);
  }

  // ارسال اطلاع‌رسانی تغییر وضعیت سفارش
  async sendOrderStatusUpdate(phoneNumber: string, orderNumber: string, status: string): Promise<boolean> {
    const message = `وضعیت سفارش ${orderNumber} به "${status}" تغییر یافت.\nبریس - تجهیزات پزشکی`;
    return this.sendSMS(phoneNumber, message);
  }

  // تولید کد تایید تصادفی
  generateVerificationCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  // اعتبارسنجی شماره تلفن ایرانی
  isValidIranianPhoneNumber(phoneNumber: string): boolean {
    const iranPhoneRegex = /^(\+98|0)?9\d{9}$/;
    return iranPhoneRegex.test(phoneNumber);
  }
}

export const smsService = new SMSService(); 