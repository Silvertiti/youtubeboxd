const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.video.findMany();
  console.log("Vidéos dans la base :", videos);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
