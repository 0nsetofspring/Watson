// server/lib/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// .env 파일의 환경변수를 로드합니다.
require('dotenv').config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;