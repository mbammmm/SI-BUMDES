import { PrismaClient } from "@prisma/client";

const prisma = (global as unknown as { prisma?: PrismaClient }).prisma || new PrismaClient();
(global as unknown as { prisma?: PrismaClient }).prisma = prisma;

export default prisma;
