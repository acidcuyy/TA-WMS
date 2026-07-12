import prisma from './src/config/database.js';

async function main() {
  console.log("Starting data truncation...");

  // Get the owner user "hananta"
  const owner = await prisma.user.findUnique({
    where: { username: 'hananta' }
  });

  if (!owner) {
    console.error("Owner 'hananta' not found!");
    process.exit(1);
  }

  const companyId = owner.companyId;

  // Truncate tables in order to avoid foreign key constraint violations
  console.log("Deleting Notifications...");
  await prisma.notification.deleteMany({});
  
  console.log("Deleting TokoOutflowItems...");
  await prisma.tokoOutflowItem.deleteMany({});
  
  console.log("Deleting TokoOutflows...");
  await prisma.tokoOutflow.deleteMany({});
  
  console.log("Deleting TokoReports...");
  await prisma.tokoReport.deleteMany({});
  
  console.log("Deleting Shipments...");
  await prisma.shipment.deleteMany({});
  
  console.log("Deleting AdminRestockRequests...");
  await prisma.adminRestockRequest.deleteMany({});
  
  console.log("Deleting RestockToAdminItems...");
  await prisma.restockToAdminItem.deleteMany({});
  
  console.log("Deleting RestockToAdminRequests...");
  await prisma.restockToAdminRequest.deleteMany({});
  
  console.log("Deleting TokoRequestItems...");
  await prisma.tokoRequestItem.deleteMany({});
  
  console.log("Deleting TokoRequests...");
  await prisma.tokoRequest.deleteMany({});
  
  console.log("Deleting WarehouseStocks...");
  await prisma.warehouseStock.deleteMany({});
  
  console.log("Deleting Products...");
  await prisma.product.deleteMany({});

  console.log("Deleting Users (except owner)...");
  await prisma.user.deleteMany({
    where: {
      username: { not: 'hananta' }
    }
  });

  console.log("Deleting Branches...");
  await prisma.branch.deleteMany({});

  console.log("Deleting CompanyProfiles (except owner's company)...");
  if (companyId) {
    await prisma.companyProfile.deleteMany({
      where: {
        id: { not: companyId }
      }
    });
  } else {
    await prisma.companyProfile.deleteMany({});
  }

  console.log("Data truncated successfully. Only owner 'hananta' remains.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
