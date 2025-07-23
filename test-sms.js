require('dotenv').config();
var Kavenegar = require('kavenegar');

var api = Kavenegar.KavenegarApi({
  apikey: '4B434F71444C3776523452336A36494D6A314C444C36704B735935376E4A78336B354D58655A7A686B4F673D'
});

console.log('Testing SMS service...');
console.log('API Key:', process.env.KAVENEGAR_API_KEY);

api.Send({
  message: "خدمات پیام کوتاه کاوه نگار",
  sender: "2000660110",
  receptor: "09354977798"
}, function(response, status) {
  console.log('Status:', status);
  console.log('Response:', JSON.stringify(response, null, 2));
  process.exit();
}); 