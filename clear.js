const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // Supprimer toutes les vidéos de la base de données
    await prisma.video.deleteMany({});
    console.log("Toutes les vidéos ont été supprimées de la base de données.");
  } catch (error) {
    console.error("Erreur lors de la suppression des vidéos : ", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
