import prisma from "../../config/database.js";

// Helper to generate custom REQ IDs
function newId(prefix = "REQ") {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${n}`;
}

function nowTimeHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function mapRequest(r) {
  if (!r) return r;
  const obj = { ...r, fromRole: "toko", toRole: "gudang" };
  if (obj.shipment && obj.shipment.startedAt !== undefined) {
    obj.shipment.startedAt = Number(obj.shipment.startedAt);
  }
  if (obj.driverProofFoto || obj.driverProofResi) {
    obj.driverProof = { foto: obj.driverProofFoto, resi: obj.driverProofResi };
  }
  if (obj.receivedProofFoto) {
    obj.proofImage = obj.receivedProofFoto;
  }
  return obj;
}

class RequestsController {
  async getRequests(req, res) {
    try {
      const companyId = req.user.companyId;
      const { status } = req.query;

      const whereClause = {
        fromBranch: { companyId }
      };

      if (status) {
        whereClause.status = status;
      }

      const requests = await prisma.tokoRequest.findMany({
        where: whereClause,
        include: {
          items: true,
          shipment: true
        },
        orderBy: { createdAt: "desc" }
      });

      const mappedRequests = requests.map(mapRequest);

      return res.json({
        success: true,
        data: mappedRequests,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        },
        include: {
          items: true,
          shipment: true
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      const responseData = mapRequest(request);

      return res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createRequest(req, res) {
    try {
      const { toBranchId, toBranchName, note, items, fromBranchId: bodyFromBranchId } = req.body;
      const companyId = req.user.companyId;
      const fromBranchId = req.user.branchId || bodyFromBranchId;

      if (!toBranchId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "toBranchId and items are required",
        });
      }

      // Get Toko (From) branch info
      const fromBranch = await prisma.branch.findFirst({
        where: { id: fromBranchId, companyId }
      });

      if (!fromBranch) {
        return res.status(400).json({
          success: false,
          message: "Logged user branch not found or unauthorized",
        });
      }

      const id = newId("REQ");
      const createdAt = new Date().toISOString().slice(0, 10);

      // Start transaction
      const newRequest = await prisma.$transaction(async (tx) => {
        // 1. Create request
        const request = await tx.tokoRequest.create({
          data: {
            id,
            fromBranchId,
            fromName: fromBranch.name,
            toBranchId,
            toName: toBranchName || "Gudang Pusat",
            createdAt,
            note: note || "",
            status: "Menunggu",
          }
        });

        // 2. Upsert products and create items
        for (const item of items) {
          const sku = item.sku || item.code;
          const name = item.name || sku;

          await tx.product.upsert({
            where: { sku },
            update: { name },
            create: {
              sku,
              name,
              category: item.category || "Lainnya",
              unit: req.body.satuan || "pcs",
              companyId
            }
          });

          await tx.tokoRequestItem.create({
            data: {
              requestId: id,
              sku,
              name,
              qty: parseInt(item.qty) || 1,
              price: item.price ? parseFloat(item.price) : 0,
            }
          });
        }

        // 3. Create Notification
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "request_toko",
            title: "Request Toko Baru",
            message: `Ada permintaan barang baru dari ${fromBranch.name} ke ${toBranchName || 'Gudang'} (${id})`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "admin,gudang",
            link: "/requests",
            companyId,
          }
        });

        return tx.tokoRequest.findUnique({
          where: { id },
          include: { items: true }
        });
      });

      return res.status(201).json({
        success: true,
        data: { ...newRequest, fromRole: "toko", toRole: "gudang" },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async decideRequest(req, res) {
    try {
      const { id } = req.params;
      const { decision } = req.body; // "Accepted" | "Declined"
      const companyId = req.user.companyId;

      if (!decision || (decision !== "Accepted" && decision !== "Declined")) {
        return res.status(400).json({
          success: false,
          message: "decision must be 'Accepted' or 'Declined'",
        });
      }

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      const updatedRequest = await prisma.$transaction(async (tx) => {
        const nextStatus = decision === "Accepted" ? "Memproses" : "Declined";

        // 1. Update Request
        const updated = await tx.tokoRequest.update({
          where: { id },
          data: {
            decision,
            status: nextStatus,
          }
        });

        // 2. Create Notification
        const notifType = decision === "Accepted" ? "request_accepted" : "request_declined";
        const notifTitle = decision === "Accepted" ? "Request Disetujui" : "Request Ditolak";
        const notifMsg = decision === "Accepted" 
          ? `Permintaan ${id} telah disetujui oleh Gudang`
          : `Permintaan ${id} ditolak oleh Gudang`;

        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: notifType,
            title: notifTitle,
            message: notifMsg,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "toko,admin",
            companyId,
          }
        });

        return updated;
      });

      return res.json({
        success: true,
        data: { ...updatedRequest, fromRole: "toko", toRole: "gudang" },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async dispatchRequest(req, res) {
    try {
      const { id } = req.params;
      const { isExternal } = req.body;
      const companyId = req.user.companyId;

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Memproses") {
        return res.status(400).json({
          success: false,
          message: "Request must be in status 'Memproses' to be dispatched",
        });
      }

      const updatedRequest = await prisma.$transaction(async (tx) => {
        let nextStatus = "Siap Dikirim";
        let isExternalDriver = false;

        if (isExternal) {
          nextStatus = "Mengirim";
          isExternalDriver = true;
        }

        // 1. Update Request
        const updated = await tx.tokoRequest.update({
          where: { id },
          data: {
            status: nextStatus,
            isExternalDriver,
          }
        });

        // 2. Create Notification
        const notifType = isExternal ? "shipping_dispatch_external" : "shipping_ready";
        const notifTitle = isExternal ? "Barang Dikirim (Eksternal)" : "Barang Siap Dikirim";
        const notifMsg = isExternal 
          ? `Permintaan ${id} telah dikirim menggunakan kurir eksternal.`
          : `Permintaan ${id} siap dikirim. Driver silakan mengambil tugas.`;

        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: notifType,
            title: notifTitle,
            message: notifMsg,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: isExternal ? "toko,admin" : "driver,admin",
            companyId,
          }
        });

        return updated;
      });

      return res.json({
        success: true,
        data: { ...updatedRequest, fromRole: "toko", toRole: "gudang" },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async confirmReceipt(req, res) {
    try {
      const { id } = req.params;
      const { proofImage, confirmationData } = req.body;
      const companyId = req.user.companyId;

      if (!proofImage || !confirmationData) {
        return res.status(400).json({
          success: false,
          message: "proofImage and confirmationData are required",
        });
      }

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        },
        include: {
          items: true
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Mengirim") {
        return res.status(400).json({
          success: false,
          message: "Request must be in status 'Mengirim' to be confirmed",
        });
      }

      // Execute transaction for receipt and stock transfer
      const result = await prisma.$transaction(async (tx) => {
        const isExternal = request.isExternalDriver;
        const nextStatus = isExternal ? "Selesai" : "Diterima Toko";
        const nowStr = new Date().toISOString();

        // 1. Update request status & proof details
        const updated = await tx.tokoRequest.update({
          where: { id },
          data: {
            status: nextStatus,
            receivedAt: nowStr,
            completedAt: isExternal ? nowStr : null,
            receivedProofFoto: proofImage,
            qtyGood: parseInt(confirmationData.qtyGood) || 0,
            qtyBad: parseInt(confirmationData.qtyBad) || 0,
            confirmationNotes: confirmationData.notes || "",
          }
        });

        // 2. Adjust inventories
        for (const item of request.items) {
          // A. Deduct stock from warehouse (source branch)
          const sourceStock = await tx.warehouseStock.findUnique({
            where: {
              sku_branchId: {
                sku: item.sku,
                branchId: request.toBranchId
              }
            }
          });

          if (sourceStock) {
            await tx.warehouseStock.update({
              where: { id: sourceStock.id },
              data: {
                qty: Math.max(0, sourceStock.qty - item.qty)
              }
            });
          }

          // B. Add stock to toko (destination branch)
          // Find original item in warehouse to copy category / price
          const originalProduct = await tx.product.findUnique({
            where: { sku: item.sku }
          });

          const qtyToAdd = confirmationData.qtyGood !== undefined && request.items.length === 1
            ? parseInt(confirmationData.qtyGood)
            : item.qty;

          await tx.warehouseStock.upsert({
            where: {
              sku_branchId: {
                sku: item.sku,
                branchId: request.fromBranchId
              }
            },
            update: {
              qty: { increment: qtyToAdd }
            },
            create: {
              sku: item.sku,
              qty: qtyToAdd,
              minQty: 5,
              branchId: request.fromBranchId,
            }
          });
        }

        // 3. Create Notification
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "received",
            title: "Barang Diterima Toko",
            message: `Toko ${request.fromName} telah mengkonfirmasi penerimaan barang (${id}). Stok toko telah diperbarui.`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "driver,gudang,admin",
            companyId,
          }
        });

        return updated;
      });

      return res.json({
        success: true,
        data: { ...result, fromRole: "toko", toRole: "gudang" },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new RequestsController();
