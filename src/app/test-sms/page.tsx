'use client';

import { useState } from 'react';

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('09354977798');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testDirectSMS = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/test-sms-direct', {
        method: 'GET',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testCustomSMS = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/test-sms-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testSendVerification = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">تست سرویس SMS</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شماره تلفن
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="09123456789"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testDirectSMS}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'در حال ارسال...' : 'تست مستقیم'}
            </button>

            <button
              onClick={testCustomSMS}
              disabled={loading || !phoneNumber}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'در حال ارسال...' : 'تست با شماره'}
            </button>

            <button
              onClick={testSendVerification}
              disabled={loading || !phoneNumber}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'در حال ارسال...' : 'تست Send Verification'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">نتیجه:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">راهنما:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>تست مستقیم:</strong> ارسال SMS به شماره پیش‌فرض</li>
            <li><strong>تست با شماره:</strong> ارسال SMS به شماره وارد شده</li>
            <li><strong>تست Send Verification:</strong> تست endpoint اصلی send-verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 