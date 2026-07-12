-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'TOKO', 'DRIVER', 'GUDANG');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'GUDANG',
    "companyId" TEXT,
    "branchId" TEXT,
    "title" TEXT,
    "vehicle" TEXT,
    "nomorSim" TEXT,
    "alamatDomisili" TEXT,
    "statusMitra" TEXT,
    "joinedAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "nib" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "phone" TEXT,
    "picName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "WarehouseStock" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 0,
    "minQty" INTEGER NOT NULL DEFAULT 0,
    "branchId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokoRequest" (
    "id" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "satuan" TEXT NOT NULL DEFAULT 'pcs',
    "note" TEXT,
    "decision" TEXT,
    "status" TEXT NOT NULL,
    "driverName" TEXT,
    "acceptedAt" TEXT,
    "shippingStartedAt" TEXT,
    "receivedAt" TEXT,
    "completedAt" TEXT,
    "isExternalDriver" BOOLEAN NOT NULL DEFAULT false,
    "driverProofResi" TEXT,
    "driverProofFoto" TEXT,
    "receivedProofFoto" TEXT,
    "qtyGood" INTEGER,
    "qtyBad" INTEGER,
    "confirmationNotes" TEXT,

    CONSTRAINT "TokoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokoRequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TokoRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockToAdminRequest" (
    "id" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toRole" TEXT NOT NULL DEFAULT 'admin',
    "toName" TEXT NOT NULL DEFAULT 'Admin',
    "createdAt" TEXT NOT NULL,
    "satuan" TEXT NOT NULL DEFAULT 'pcs',
    "note" TEXT,
    "supplier" TEXT,
    "decision" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "proofImage" TEXT,
    "qtyGood" INTEGER,
    "qtyBad" INTEGER,
    "confirmationNotes" TEXT,

    CONSTRAINT "RestockToAdminRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockToAdminItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "RestockToAdminItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRestockRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "cabangGudangId" TEXT NOT NULL,
    "cabangGudangNama" TEXT NOT NULL,
    "kodeBarang" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "jenisBarang" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL DEFAULT 'pcs',
    "supplier" TEXT,
    "prioritas" TEXT NOT NULL DEFAULT 'Normal',
    "catatan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "completedAt" TEXT,
    "proofCheckBarang" TEXT,
    "proofResiDriver" TEXT,
    "proofPemasukanBarang" TEXT,
    "qtyGood" INTEGER,
    "qtyBad" INTEGER,
    "confirmationNotes" TEXT,

    CONSTRAINT "AdminRestockRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "startAddress" TEXT NOT NULL,
    "endAddress" TEXT NOT NULL,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLng" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION NOT NULL,
    "endLng" DOUBLE PRECISION NOT NULL,
    "startedAt" BIGINT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "driverLat" DOUBLE PRECISION NOT NULL,
    "driverLng" DOUBLE PRECISION NOT NULL,
    "driverIsLive" BOOLEAN NOT NULL DEFAULT false,
    "driverName" TEXT NOT NULL,
    "driverProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokoReport" (
    "id" TEXT NOT NULL,
    "tokoId" TEXT NOT NULL,
    "tokoName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Tersedia',
    "author" TEXT NOT NULL,
    "branchType" TEXT NOT NULL DEFAULT 'toko',

    CONSTRAINT "TokoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokoOutflow" (
    "id" TEXT NOT NULL,
    "tokoId" TEXT NOT NULL,
    "tokoName" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "tujuan" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "catatan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Selesai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokoOutflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokoOutflowItem" (
    "id" TEXT NOT NULL,
    "outflowId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "TokoOutflowItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "targetRoles" TEXT NOT NULL,
    "link" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseStock_sku_branchId_key" ON "WarehouseStock"("sku", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_requestId_key" ON "Shipment"("requestId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_sku_fkey" FOREIGN KEY ("sku") REFERENCES "Product"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoRequest" ADD CONSTRAINT "TokoRequest_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoRequest" ADD CONSTRAINT "TokoRequest_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoRequestItem" ADD CONSTRAINT "TokoRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TokoRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoRequestItem" ADD CONSTRAINT "TokoRequestItem_sku_fkey" FOREIGN KEY ("sku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockToAdminRequest" ADD CONSTRAINT "RestockToAdminRequest_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockToAdminItem" ADD CONSTRAINT "RestockToAdminItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RestockToAdminRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockToAdminItem" ADD CONSTRAINT "RestockToAdminItem_sku_fkey" FOREIGN KEY ("sku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRestockRequest" ADD CONSTRAINT "AdminRestockRequest_cabangGudangId_fkey" FOREIGN KEY ("cabangGudangId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TokoRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoReport" ADD CONSTRAINT "TokoReport_tokoId_fkey" FOREIGN KEY ("tokoId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoOutflow" ADD CONSTRAINT "TokoOutflow_tokoId_fkey" FOREIGN KEY ("tokoId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokoOutflowItem" ADD CONSTRAINT "TokoOutflowItem_outflowId_fkey" FOREIGN KEY ("outflowId") REFERENCES "TokoOutflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
