import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Add your seeding logic here
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
