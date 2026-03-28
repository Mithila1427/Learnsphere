import dotenv from 'dotenv';
dotenv.config();
console.log('NODE_ENV=', process.env.NODE_ENV);
console.log('PORT=', process.env.PORT);
console.log('MONGO_URI present=', !!process.env.MONGO_URI);
console.log('JWT_SECRET present=', !!process.env.JWT_SECRET);
