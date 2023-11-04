const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    await database.category.createMany({
      data: [
        { name: "Computer Science" },
        { name: "Music" },
        { name: "Finess" },
        { name: "Photography" },
        { name: "Accounting" },
        { name: "Engineering" },
        { name: "Filming" },
      ],
    });
    console.log("Success");
  } catch (error) {
    console.log("ERROR SENDING THE DATABASE CATEGORIES", error);
  } finally {
    await database.$disconnect();
  }
}
main();
