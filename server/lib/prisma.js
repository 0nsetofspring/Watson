// server/lib/prisma.js

// 파일마다 DB 커넥션 풀을 새로 만들어 불필요한 리소스를 사용하는 대신
// Prisma Client 인스턴스를 딱 한 번만 생성하고, 필요한 모든 파일에서 가져다 쓰는 방식으로 변경

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;