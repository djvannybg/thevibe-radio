import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Създаваме админ потребител
  const email = 'admin@thevibe.tv'
  const passwordPlain = 'kovachev90!' // смени след първи логин
  const password = await bcrypt.hash(passwordPlain, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password, role: 'ADMIN' }
  })

  console.log('Seeded admin:', admin.email)

  // 2. Създаваме примерни категории (ако не съществуват)
  const categories = [
    { name: 'Новини', slug: 'novini' },
    { name: 'Музика', slug: 'muzika' },
    { name: 'Интервюта', slug: 'interview' }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
  }

  console.log('Seeded categories:', categories.map(c => c.name).join(', '))
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
