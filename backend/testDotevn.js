
import dotenv from 'dotenv';
dotenv.config();
console.log('cwd:', process.cwd());
console.log('MONGO_URI present:', !!process.env.MONGO_URI);
console.log('MONGO_URI:', process.env.MONGO_URI ? '[REDACTED]' : process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

