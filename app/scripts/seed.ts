
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('starting seed...')

  // create test user (required for testing)
  const hashedPassword = await bcryptjs.hash('johndoe123', 10)
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
    },
  })

  // create default categories for the test user
  const defaultCategories = [
    { name: 'Work', color: '#3B82F6', isDefault: true },
    { name: 'Personal', color: '#10B981', isDefault: true },
    { name: 'Health', color: '#F59E0B', isDefault: true },
    { name: 'Study', color: '#8B5CF6', isDefault: true },
  ]

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { 
        userId_name: {
          userId: testUser.id,
          name: cat.name
        }
      },
      update: {},
      create: {
        ...cat,
        userId: testUser.id,
      },
    })
  }

  // create some study subjects for demo
  const studyCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Study' }
  })

  if (studyCategory) {
    const subjects = [
      { name: 'Mathematics', color: '#EF4444' },
      { name: 'Computer Science', color: '#06B6D4' },
      { name: 'History', color: '#84CC16' }
    ]

    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: {
          userId_name: {
            userId: testUser.id,
            name: subject.name
          }
        },
        update: {},
        create: {
          ...subject,
          userId: testUser.id
        }
      })
    }
  }

  // create some sample tasks for demo
  const workCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Work' }
  })

  const personalCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Personal' }
  })

  const mathSubject = await prisma.subject.findFirst({
    where: { userId: testUser.id, name: 'Mathematics' }
  })

  const csSubject = await prisma.subject.findFirst({
    where: { userId: testUser.id, name: 'Computer Science' }
  })

  if (workCategory && personalCategory && studyCategory) {
    const sampleTasks = [
      {
        title: 'finish quarterly report',
        description: 'complete q4 analysis and send to management',
        priority: 3,
        status: 'todo',
        categoryId: workCategory.id,
        userId: testUser.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: 'grocery shopping',
        description: 'buy ingredients for weekend cooking',
        priority: 2,
        status: 'todo',
        categoryId: personalCategory.id,
        userId: testUser.id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      },
      {
        title: 'team meeting prep',
        description: 'review project status and prepare talking points',
        priority: 2,
        status: 'in_progress',
        categoryId: workCategory.id,
        userId: testUser.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
      },
      {
        title: 'study calculus chapter 5',
        description: 'integration and differential equations practice',
        priority: 2,
        status: 'todo',
        categoryId: studyCategory.id,
        subjectId: mathSubject?.id,
        userId: testUser.id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      },
      {
        title: 'practice algorithms problems',
        description: 'solve 5 leetcode problems on dynamic programming',
        priority: 3,
        status: 'todo',
        categoryId: studyCategory.id,
        subjectId: csSubject?.id,
        userId: testUser.id,
      }
    ]

    for (const task of sampleTasks) {
      // check if task exists first
      const existing = await prisma.task.findFirst({
        where: { 
          title: task.title,
          userId: testUser.id
        }
      })
      
      if (!existing) {
        await prisma.task.create({ data: task })
      }
    }
  }

  console.log('seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
