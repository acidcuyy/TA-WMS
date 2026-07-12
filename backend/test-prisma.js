import prisma from "./src/config/database.js";

async function main() {
  const req = await prisma.restockToAdminRequest.findMany({
    orderBy: { id: "desc" },
    take: 1
  });
  console.log("Last Request:", req);
}
main().catch(console.error).finally(() => prisma.$disconnect());
