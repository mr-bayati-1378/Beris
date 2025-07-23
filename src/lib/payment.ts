import crypto from 'crypto';
import prisma from './prisma';

export interface PaymentGatewayConfig {
  merchantId: string;
  apiKey?: string;
  terminalId?: string;
  username?: string;
  password?: string;
  sandbox?: boolean;
}

export interface PaymentRequest {
  amount: number; // تومان
  orderId: string;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

export interface PaymentResponse {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  token?: string;
  error?: string;
  trackingCode?: string;
}

export interface VerifyResponse {
  success: boolean;
  verified: boolean;
  amount?: number;
  refId?: string;
  trackingCode?: string;
  error?: string;
}

export abstract class PaymentGateway {
  protected config: PaymentGatewayConfig;
  protected sandbox: boolean;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
    this.sandbox = config.sandbox || false;
  }

  abstract request(payment: PaymentRequest): Promise<PaymentResponse>;
  abstract verify(authority: string, amount: number): Promise<VerifyResponse>;
  abstract getPaymentUrl(authority: string): string;
}

// درگاه زرین‌پال
export class ZarinPalGateway extends PaymentGateway {
  private baseUrl = this.sandbox 
    ? 'https://sandbox.zarinpal.com/pg'
    : 'https://payment.zarinpal.com/pg';

  async request(payment: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v4/payment/request.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          amount: payment.amount,
          description: payment.description,
          callback_url: payment.callbackUrl,
          metadata: {
            mobile: payment.mobile,
            email: payment.email,
          },
        }),
      });

      const data = await response.json();

      if (data.data && data.data.code === 100) {
        return {
          success: true,
          authority: data.data.authority,
          paymentUrl: this.getPaymentUrl(data.data.authority),
        };
      }

      return {
        success: false,
        error: `ZarinPal Error: ${data.errors?.code || 'Unknown error'}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network Error: ${error}`,
      };
    }
  }

  async verify(authority: string, amount: number): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v4/payment/verify.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          amount: amount,
          authority: authority,
        }),
      });

      const data = await response.json();

      if (data.data && data.data.code === 100) {
        return {
          success: true,
          verified: true,
          amount: data.data.amount,
          refId: data.data.ref_id,
          trackingCode: data.data.ref_id,
        };
      }

      return {
        success: false,
        verified: false,
        error: `Verification failed: ${data.errors?.code || 'Unknown error'}`,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: `Network Error: ${error}`,
      };
    }
  }

  getPaymentUrl(authority: string): string {
    return `${this.baseUrl}/StartPay/${authority}`;
  }
}

// درگاه سامان بانک
export class SamanGateway extends PaymentGateway {
  private baseUrl = this.sandbox
    ? 'https://sandbox.sep.ir'
    : 'https://sep.shaparak.ir';

  async request(payment: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = this.generateToken(payment);
      
      const response = await fetch(`${this.baseUrl}/onlinepg/onlinepg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'token',
          TerminalId: this.config.terminalId,
          Amount: payment.amount,
          ResNum: payment.orderId,
          RedirectUrl: payment.callbackUrl,
          CellNumber: payment.mobile,
        }),
      });

      const data = await response.json();

      if (data.status === 1 && data.token) {
        return {
          success: true,
          token: data.token,
          paymentUrl: this.getPaymentUrl(data.token),
        };
      }

      return {
        success: false,
        error: `Saman Error: ${data.errorDesc || 'Unknown error'}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network Error: ${error}`,
      };
    }
  }

  async verify(token: string, amount: number): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/onlinepg/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Token: token,
          RefNum: token, // Saman uses token as RefNum for verification
        }),
      });

      const data = await response.json();

      if (data.ResultCode === 0) {
        return {
          success: true,
          verified: true,
          amount: amount,
          refId: data.RefNum,
          trackingCode: data.TraceNo,
        };
      }

      return {
        success: false,
        verified: false,
        error: `Verification failed: ${data.ResultCode}`,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: `Network Error: ${error}`,
      };
    }
  }

  getPaymentUrl(token: string): string {
    return `${this.baseUrl}/onlinepg/sendToken?token=${token}`;
  }

  private generateToken(payment: PaymentRequest): string {
    const data = `${this.config.terminalId}${payment.amount}${payment.orderId}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// درگاه ملت
export class MellatGateway extends PaymentGateway {
  private baseUrl = this.sandbox
    ? 'https://sandbox.banktest.ir/mellat'
    : 'https://bpm.shaparak.ir/pgwchannel/services/pgw';

  async request(payment: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml',
          'SOAPAction': 'bpPayRequest',
        },
        body: this.createSoapRequest(payment),
      });

      const xmlText = await response.text();
      const refId = this.extractFromXml(xmlText, 'return');

      if (refId && refId !== '0') {
        return {
          success: true,
          authority: refId,
          paymentUrl: this.getPaymentUrl(refId),
        };
      }

      return {
        success: false,
        error: `Mellat Error: ${refId || 'Unknown error'}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network Error: ${error}`,
      };
    }
  }

  async verify(authority: string, amount: number): Promise<VerifyResponse> {
    try {
      // First verify
      const verifyResponse = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml',
          'SOAPAction': 'bpVerifyRequest',
        },
        body: this.createVerifySoapRequest(authority),
      });

      const verifyXml = await verifyResponse.text();
      const verifyResult = this.extractFromXml(verifyXml, 'return');

      if (verifyResult === '0') {
        // Then settle
        const settleResponse = await fetch(`${this.baseUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/soap+xml',
            'SOAPAction': 'bpSettleRequest',
          },
          body: this.createSettleSoapRequest(authority),
        });

        const settleXml = await settleResponse.text();
        const settleResult = this.extractFromXml(settleXml, 'return');

        if (settleResult === '0') {
          return {
            success: true,
            verified: true,
            amount: amount,
            refId: authority,
            trackingCode: authority,
          };
        }
      }

      return {
        success: false,
        verified: false,
        error: `Verification failed: ${verifyResult}`,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: `Network Error: ${error}`,
      };
    }
  }

  getPaymentUrl(authority: string): string {
    return `https://bpm.shaparak.ir/pgwchannel/startpay.mellat?RefId=${authority}`;
  }

  private createSoapRequest(payment: PaymentRequest): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <bpPayRequest>
            <terminalId>${this.config.terminalId}</terminalId>
            <userName>${this.config.username}</userName>
            <userPassword>${this.config.password}</userPassword>
            <orderId>${payment.orderId}</orderId>
            <amount>${payment.amount}</amount>
            <localDate>${new Date().toISOString().slice(0, 10).replace(/-/g, '')}</localDate>
            <localTime>${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}</localTime>
            <additionalData></additionalData>
            <callBackUrl>${payment.callbackUrl}</callBackUrl>
            <payerId>0</payerId>
          </bpPayRequest>
        </soap:Body>
      </soap:Envelope>`;
  }

  private createVerifySoapRequest(refId: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <bpVerifyRequest>
            <terminalId>${this.config.terminalId}</terminalId>
            <userName>${this.config.username}</userName>
            <userPassword>${this.config.password}</userPassword>
            <orderId>${refId}</orderId>
            <saleOrderId>${refId}</saleOrderId>
            <saleReferenceId>${refId}</saleReferenceId>
          </bpVerifyRequest>
        </soap:Body>
      </soap:Envelope>`;
  }

  private createSettleSoapRequest(refId: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <bpSettleRequest>
            <terminalId>${this.config.terminalId}</terminalId>
            <userName>${this.config.username}</userName>
            <userPassword>${this.config.password}</userPassword>
            <orderId>${refId}</orderId>
            <saleOrderId>${refId}</saleOrderId>
            <saleReferenceId>${refId}</saleReferenceId>
          </bpSettleRequest>
        </soap:Body>
      </soap:Envelope>`;
  }

  private extractFromXml(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
    const match = xml.match(regex);
    return match ? match[1] : '';
  }
}

// فکتوری برای ساخت Gateway ها
export class PaymentGatewayFactory {
  static async createGateway(gatewayName: string): Promise<PaymentGateway> {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: gatewayName, isActive: true },
    });

    if (!gateway) {
      throw new Error(`Gateway ${gatewayName} not found or not active`);
    }

    // Type-safe config parsing
    const config = gateway.config as unknown as PaymentGatewayConfig;
    
    // Validate config has required fields
    if (!config || typeof config !== 'object' || !config.merchantId) {
      throw new Error(`Invalid configuration for gateway ${gatewayName}`);
    }

    switch (gatewayName.toLowerCase()) {
      case 'zarinpal':
        return new ZarinPalGateway(config);
      case 'saman':
        return new SamanGateway(config);
      case 'mellat':
        return new MellatGateway(config);
      default:
        throw new Error(`Unsupported gateway: ${gatewayName}`);
    }
  }

  static async getAvailableGateways() {
    return await prisma.paymentGateway.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
      },
    });
  }
}

// سرویس مدیریت پرداخت
export class PaymentService {
  static async createPayment(
    orderId: string,
    gatewayName: string,
    callbackUrl: string
  ) {
    try {
      // دریافت سفارش
      const order = await prisma.order.findUnique({
        where: { slug: orderId },
        include: { user: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // دریافت Gateway
      const gatewayRecord = await prisma.paymentGateway.findUnique({
        where: { name: gatewayName, isActive: true },
      });

      if (!gatewayRecord) {
        throw new Error('Gateway not found');
      }

      // ساخت Gateway instance
      const gateway = await PaymentGatewayFactory.createGateway(gatewayName);

      // ایجاد پرداخت در دیتابیس
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          gatewayId: gatewayRecord.id,
          amount: Number(order.total),
          status: 'PENDING',
          callbackUrl,
        },
      });

      // درخواست پرداخت از Gateway
      const paymentRequest: PaymentRequest = {
        amount: Number(order.total),
        orderId: order.slug,
        description: `پرداخت سفارش شماره ${order.slug}`,
        callbackUrl: `${callbackUrl}?payment_id=${payment.id}`,
        mobile: order.user?.phone,
        email: order.user?.email || undefined,
      };

      const result = await gateway.request(paymentRequest);

      if (result.success) {
        // به‌روزرسانی پرداخت
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            transactionId: result.authority || result.token,
            status: 'PROCESSING',
            gatewayResponse: JSON.parse(JSON.stringify(result)),
          },
        });

        return {
          success: true,
          paymentId: payment.id,
          paymentUrl: result.paymentUrl,
        };
      } else {
        // به‌روزرسانی پرداخت با خطا
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failedReason: result.error,
            gatewayResponse: JSON.parse(JSON.stringify(result)),
          },
        });

        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async verifyPayment(paymentId: number, authority: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { gateway: true, order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'VERIFIED') {
        return {
          success: true,
          verified: true,
          message: 'Payment already verified',
        };
      }

      // ساخت Gateway instance
      const gateway = await PaymentGatewayFactory.createGateway(
        payment.gateway.name
      );

      // تایید پرداخت
      const result = await gateway.verify(authority, Number(payment.amount));

      if (result.verified) {
        // به‌روزرسانی پرداخت
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'VERIFIED',
            referenceId: result.refId,
            trackingCode: result.trackingCode,

            paidAt: new Date(),
            gatewayResponse: JSON.parse(JSON.stringify(result)),
          },
        });

        // به‌روزرسانی سفارش
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PROCESSING' },
        });

        return {
          success: true,
          verified: true,
          trackingCode: result.trackingCode,
          refId: result.refId,
        };
      } else {
        // به‌روزرسانی پرداخت با عدم تایید
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failedReason: result.error,
            gatewayResponse: JSON.parse(JSON.stringify(result)),
          },
        });

        return {
          success: false,
          verified: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
} 