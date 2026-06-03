import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

// Named export pour la compatibilité avec `import { prisma } from '@/lib/prisma'`
export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
