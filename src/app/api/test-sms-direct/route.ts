import { NextRequest } from 'next/server';
import { smsService } from '@/lib/sms';

export async function GET() {
  try {
    console.log('🧪 Direct SMS Test Started');
    
    // تست با شماره ثابت
    const testPhone = '09354977798';
    const testCode = smsService.generateVerificationCode();
    
    console.log('📱 Testing SMS to:', testPhone);
    console.log('🔢 Code:', testCode);
    
    const result = await smsService.sendVerificationCode(testPhone, testCode);
    
    console.log('📊 SMS Result:', result);
    
    return Response.json({
      success: result,
      message: result ? 'SMS sent successfully' : 'SMS failed',
      phone: testPhone,
      code: testCode,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Direct SMS Test Error:', error);
    return Response.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Custom SMS Test Started');
    
    const body = await request.json();
    const { phoneNumber } = body;
    
    if (!phoneNumber) {
      return Response.json({
        success: false,
        error: 'phoneNumber is required'
      }, { status: 400 });
    }
    
    console.log('📱 Testing SMS to:', phoneNumber);
    
    const testCode = smsService.generateVerificationCode();
    console.log('🔢 Code:', testCode);
    
    const result = await smsService.sendVerificationCode(phoneNumber, testCode);
    
    console.log('📊 SMS Result:', result);
    
    return Response.json({
      success: result,
      message: result ? 'SMS sent successfully' : 'SMS failed',
      phone: phoneNumber,
      code: testCode,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Custom SMS Test Error:', error);
    return Response.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 