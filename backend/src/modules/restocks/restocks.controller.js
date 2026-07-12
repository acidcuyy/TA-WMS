import prisma from "../../config/database.js";

function newId(prefix = "RST") {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${n}`;
}

function nowTimeHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

class RestocksController {
  /* =========================================================
   * GUDANG ⇄ ADMIN RESTOCK (RST-XXX)
   * ========================================================= */

  async getRestockToAdmin(req, res) {
    try {
      const companyId = req.user.companyId;
      const requests = await prisma.restockToAdminRequest.findMany({
        where: {
          branch: { companyId }
        },
        include: {
          items: true
        },
        orderBy: { createdAt: "desc" }
      });

      const mapped = requests.map(r => ({ ...r, fromRole: "gudang" }));

      return res.json({
        success: true,
        data: mapped,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createRestockToAdmin(req, res) {
    try {
      const { note, supplier, items } = req.body;
      const companyId = req.user.companyId;
      
      let fromBranchId = req.user.branchId;
      if (!fromBranchId) {
        const userDb = await prisma.user.findUnique({ where: { id: req.user.id } });
        fromBranchId = userDb?.branchId;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "items array is required",
        });
      }

      const branch = await prisma.branch.findFirst({
        where: { id: fromBranchId, companyId }
      });

      if (!branch) {
        return res.status(400).json({
          success: false,
          message: "Gudang branch not found or unauthorized",
        });
      }

      const id = newId("RST");
      const createdAt = new Date().toISOString().slice(0, 10);

      const newRequest = await prisma.$transaction(async (tx) => {
        // 1. Create request
        const request = await tx.restockToAdminRequest.create({
          data: {
            id,
            fromBranchId,
            fromName: branch.name,
            createdAt,
            note: note || "",
            supplier: supplier || "",
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

          await tx.restockToAdminItem.create({
            data: {
              requestId: id,
              sku,
              name,
              qty: parseInt(item.qty) || 1,
            }
          });
        }

        // 3. Create Notification for Admin
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "restock_new",
            title: "Request Restock",
            message: `Gudang mengirim permintaan restock barang (${id})`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "admin",
            companyId,
          }
        });

        return tx.restockToAdminRequest.findUnique({
          where: { id },
          include: { items: true }
        });
      });

      return res.status(201).json({
        success: true,
        data: { ...newRequest, fromRole: "gudang" },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async adminDecideRestock(req, res) {
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

      const request = await prisma.restockToAdminRequest.findFirst({
        where: {
          id,
          branch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const nextStatus = decision === "Accepted" ? "Diproses" : "Ditolak";

        const updatedReq = await tx.restockToAdminRequest.update({
          where: { id },
          data: {
            decision,
            status: nextStatus,
          }
        });

        // Create Notification
        const notifType = decision === "Accepted" ? "restock_accepted" : "restock_declined";
        const notifTitle = decision === "Accepted" ? "Restock Disetujui" : "Restock Ditolak";
        const notifMsg = decision === "Accepted" 
          ? `Permintaan restock ${id} telah disetujui Admin`
          : `Permintaan restock ${id} ditolak oleh Admin`;

        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: notifType,
            title: notifTitle,
            message: notifMsg,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "gudang",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async gudangFinishRestockWithProof(req, res) {
    try {
      const { id } = req.params;
      const { proofImage, confirmationData } = req.body;
      const companyId = req.user.companyId;

      const request = await prisma.restockToAdminRequest.findFirst({
        where: {
          id,
          branch: { companyId }
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

      if (request.status !== "Diproses") {
        return res.status(400).json({
          success: false,
          message: "Request status must be 'Diproses' to complete",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Update Request details
        const updatedReq = await tx.restockToAdminRequest.update({
          where: { id },
          data: {
            proofImage: proofImage || null,
            status: "Selesai",
            qtyGood: confirmationData ? parseInt(confirmationData.qtyGood) : null,
            qtyBad: confirmationData ? parseInt(confirmationData.qtyBad) : null,
            confirmationNotes: confirmationData ? (confirmationData.notes || "") : null,
          }
        });

        // 2. Increase WarehouseStock
        for (const item of request.items) {
          const qtyToAdd = confirmationData && request.items.length === 1
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
              minQty: 30,
              branchId: request.fromBranchId,
            }
          });
        }

        // 3. Notification for Admin
        let notifMsg = `Proses restock ${id} telah selesai dengan bukti terlampir.`;
        if (confirmationData) {
          notifMsg += ` Diterima baik: ${confirmationData.qtyGood}.`;
          if (parseInt(confirmationData.qtyBad) > 0) {
            notifMsg += ` Rusak: ${confirmationData.qtyBad}.`;
          }
        }

        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "restock_done",
            title: "Restock Selesai",
            message: notifMsg,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "admin",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /* =========================================================
   * ADMIN ⇄ GUDANG RESTOCK (ARST-XXX)
   * ========================================================= */

  async getAdminRestockToGudang(req, res) {
    try {
      const companyId = req.user.companyId;
      const requests = await prisma.adminRestockRequest.findMany({
        where: {
          branch: { companyId }
        },
        orderBy: { createdAt: "desc" }
      });

      return res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createAdminRestockToGudang(req, res) {
    try {
      const {
        cabangGudang,
        cabangGudangNama,
        kodeBarang,
        namaBarang,
        jenisBarang,
        jumlah,
        satuan,
        supplier,
        prioritas,
        catatan,
      } = req.body;
      const companyId = req.user.companyId;

      if (!cabangGudang || !kodeBarang || !jumlah) {
        return res.status(400).json({
          success: false,
          message: "cabangGudang, kodeBarang, and jumlah are required",
        });
      }

      const id = newId("ARST");
      const createdAt = new Date().toISOString().slice(0, 10);

      const request = await prisma.$transaction(async (tx) => {
        // 1. Create request
        const newReq = await tx.adminRestockRequest.create({
          data: {
            id,
            createdAt,
            cabangGudangId: cabangGudang,
            cabangGudangNama: cabangGudangNama || "Gudang Pusat",
            kodeBarang,
            namaBarang: namaBarang || kodeBarang,
            jenisBarang: jenisBarang || "General",
            jumlah: parseInt(jumlah),
            satuan: satuan || "pcs",
            supplier: supplier || "",
            prioritas: prioritas || "Normal",
            catatan: catatan || "",
            status: "Pending",
          }
        });

        // 2. Notification to Gudang
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "admin_restock_new",
            title: "Request Restock dari Admin",
            message: `Admin mengirim permintaan restock ${namaBarang || kodeBarang} (${jumlah} ${satuan || 'pcs'}) ke ${cabangGudangNama || 'Gudang'} (${id})`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "gudang",
            companyId,
          }
        });

        return newReq;
      });

      return res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async gudangAcceptAdminRestock(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      const request = await prisma.adminRestockRequest.findFirst({
        where: {
          id,
          branch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "Request status must be 'Pending' to accept",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedReq = await tx.adminRestockRequest.update({
          where: { id },
          data: {
            status: "Diproses"
          }
        });

        // Notification to Admin
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "admin_restock_accepted",
            title: "Restock Diterima Gudang",
            message: `Request restock ${id} telah diterima oleh Gudang dan sedang diproses`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "admin",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async gudangUploadProofAndFinish(req, res) {
    try {
      const { id } = req.params;
      const { proofPhotos, confirmationData } = req.body;
      const companyId = req.user.companyId;

      const request = await prisma.adminRestockRequest.findFirst({
        where: {
          id,
          branch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Diproses") {
        return res.status(400).json({
          success: false,
          message: "Request status must be 'Diproses' to complete",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const completedAt = new Date().toISOString().slice(0, 10);

        // 1. Update request status & proof check
        const updatedReq = await tx.adminRestockRequest.update({
          where: { id },
          data: {
            status: "Selesai",
            completedAt,
            proofCheckBarang: proofPhotos ? JSON.stringify(proofPhotos.checkBarang || []) : null,
            proofResiDriver: proofPhotos ? JSON.stringify(proofPhotos.resiDriver || []) : null,
            proofPemasukanBarang: proofPhotos ? JSON.stringify(proofPhotos.pemasukanBarang || []) : null,
            qtyGood: confirmationData ? parseInt(confirmationData.qtyGood) : null,
            qtyBad: confirmationData ? parseInt(confirmationData.qtyBad) : null,
            confirmationNotes: confirmationData ? (confirmationData.notes || "") : null,
          }
        });

        // 2. Increase WarehouseStock
        const qtyToAdd = confirmationData ? parseInt(confirmationData.qtyGood) : request.jumlah;

        // Ensure product exists
        await tx.product.upsert({
          where: { sku: request.kodeBarang },
          update: {
            name: request.namaBarang,
            category: request.jenisBarang
          },
          create: {
            sku: request.kodeBarang,
            name: request.namaBarang,
            category: request.jenisBarang,
            unit: request.satuan || "pcs",
            companyId
          }
        });

        await tx.warehouseStock.upsert({
          where: {
            sku_branchId: {
              sku: request.kodeBarang,
              branchId: request.cabangGudangId
            }
          },
          update: {
            qty: { increment: qtyToAdd }
          },
          create: {
            sku: request.kodeBarang,
            qty: qtyToAdd,
            minQty: 30,
            branchId: request.cabangGudangId,
          }
        });

        // 3. Notification to Admin
        let notifMsg = `Proses restock ${id} (${request.namaBarang}) telah selesai. Bukti foto telah diunggah oleh Gudang.`;
        if (confirmationData) {
          notifMsg += ` Diterima baik: ${confirmationData.qtyGood}.`;
          if (parseInt(confirmationData.qtyBad) > 0) {
            notifMsg += ` Rusak: ${confirmationData.qtyBad}.`;
          }
        }

        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "admin_restock_done",
            title: "Restock Selesai",
            message: notifMsg,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "admin",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new RestocksController();
