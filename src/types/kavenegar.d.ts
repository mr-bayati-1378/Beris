declare module 'kavenegar' {
  interface KavenegarConfig {
    apikey: string;
  }

  interface KavenegarSendParams {
    message: string;
    sender?: string;
    receptor: string;
    date?: number;
    type?: number;
    localid?: number;
  }

  interface KavenegarStatusParams {
    messageid: number;
  }

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

  interface KavenegarAccountResponse {
    return: {
      status: number;
      message: string;
    };
    entries?: Array<{
      account: string;
      credit: number;
      expiredate: string;
      type: string;
    }>;
  }

  interface KavenegarApi {
    Send(params: KavenegarSendParams, callback: (response: KavenegarResponse, status: number) => void): void;
    Status(params: KavenegarStatusParams, callback: (response: KavenegarResponse, status: number) => void): void;
    AccountInfo(params: {}, callback: (response: KavenegarAccountResponse, status: number) => void): void;
  }

  function KavenegarApi(config: KavenegarConfig): KavenegarApi;

  export = {
    KavenegarApi
  };
} 