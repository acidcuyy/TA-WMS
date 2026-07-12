import prisma from "./src/config/database.js";
async function main() {
  const shipment = await prisma.shipment.findFirst({
    where: { requestId: 'REQ-863' }
  });
  console.log("Shipment for REQ-863:", shipment);
}
main();
