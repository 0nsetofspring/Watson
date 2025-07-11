const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { JWT_SECRET } = process.env;

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '인증 헤더가 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Bearer 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 요청 객체에 사용자 정보를 추가
    req.user = user;
    next(); // 다음 미들웨어로 진행

  } catch (error) {
    // 토큰 만료 또는 검증 실패 시
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = isLoggedIn;