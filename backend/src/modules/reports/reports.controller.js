import prisma from "../../config/database.js";

function newId(prefix = "RPT") {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${n}`;
}

class ReportsController {
  /* =========================================================
   * REPORTS (TOKO & GUDANG)
   * ========================================================= */

  async getReports(req, res) {
    try {
      const { branchType } = req.query; // "toko" | "gudang"
      const companyId = req.user.companyId;

      const reports = await prisma.tokoReport.findMany({
        where: {
          branchType: branchType || undefined,
          branch: { companyId }
        },
        orderBy: { date: "desc" }
      });

      return res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async uploadReport(req, res) {
    try {
      const companyId = req.user.companyId;
      const { tokoId, tokoName, type, period, date, format, fileData, author, branchType } = req.body;

      const targetBranchId = tokoId || req.user.branchId;

      if (!targetBranchId || !type) {
        return res.status(400).json({
          success: false,
          message: "tokoId and type are required",
        });
      }

      // Verify branch exists and belongs to same company
      const branch = await prisma.branch.findFirst({
        where: { id: targetBranchId, companyId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found or unauthorized",
        });
      }

      const id = newId(branchType === "gudang" ? "RPT-GDG-" : "RPT");
      const uploadDate = date || new Date().toISOString().slice(0, 10);

      const report = await prisma.$transaction(async (tx) => {
        // 1. Create Report
        const rep = await tx.tokoReport.create({
          data: {
            id,
            tokoId: targetBranchId,
            tokoName: tokoName || branch.name,
            type,
            period: period || "",
            date: uploadDate,
            format: format || "PDF",
            fileData: fileData || null,
            status: "Tersedia",
            author: author || "Staf Cabang",
            branchType: branchType || "toko",
          }
        });

        // 2. Create Notification
        const notifType = branchType === "gudang" ? "gudang_report_new" : "toko_report_new";
        const notifTitle = branchType === "gudang" ? "Laporan Gudang Baru" : "Laporan Toko Baru";

        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: notifType,
            title: notifTitle,
            message: `${tokoName || branch.name} telah mengunggah ${type} (${id})`,
            time: new Date().toLocaleTimeString().slice(0, 5),
            isRead: false,
            targetRoles: "admin",
            companyId,
          }
        });

        return rep;
      });

      return res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /* =========================================================
   * TOKO OUTFLOWS
   * ========================================================= */

  async getTokoOutflows(req, res) {
    try {
      const companyId = req.user.companyId;
      const branchId = req.user.branchId;

      const outflows = await prisma.tokoOutflow.findMany({
        where: {
          tokoId: branchId || undefined,
          branch: { companyId }
        },
        include: {
          items: true
        },
        orderBy: { createdAt: "desc" }
      });

      return res.json({
        success: true,
        data: outflows,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createTokoOutflow(req, res) {
    try {
      const companyId = req.user.companyId;
      const { items, tujuan, jenis, catatan, tokoName, tokoId: bodyTokoId } = req.body;
      const tokoId = req.user.branchId || bodyTokoId;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "items array is required",
        });
      }

      if (!tokoId) {
        return res.status(400).json({
          success: false,
          message: "tokoId is missing from request body and user profile",
        });
      }

      // Verify branch belongs to same company
      const branch = await prisma.branch.findFirst({
        where: { id: tokoId, companyId }
      });

      if (!branch) {
        return res.status(400).json({
          success: false,
          message: "Toko branch not found or unauthorized",
        });
      }

      const id = newId("OUT");

      const outflow = await prisma.$transaction(async (tx) => {
        const totalQty = items.reduce((s, i) => s + (parseInt(i.qty) || 0), 0);

        // 1. Create outflow
        const out = await tx.tokoOutflow.create({
          data: {
            id,
            tokoId,
            tokoName: tokoName || branch.name,
            totalQty,
            tujuan: tujuan || "",
            jenis: jenis || "Penjualan",
            catatan: catatan || "",
            status: "Selesai",
          }
        });

        // 2. Create outflow items and deduct stock
        for (const item of items) {
          await tx.tokoOutflowItem.create({
            data: {
              outflowId: id,
              sku: item.sku,
              name: item.name || item.sku,
              qty: parseInt(item.qty) || 1,
            }
          });

          // Deduct from toko branch stock
          const stock = await tx.warehouseStock.findFirst({
            where: {
              sku: item.sku,
              branchId: tokoId,
            }
          });

          if (stock) {
            await tx.warehouseStock.update({
              where: { id: stock.id },
              data: {
                qty: Math.max(0, stock.qty - (parseInt(item.qty) || 0))
              }
            });
          }
        }

        return tx.tokoOutflow.findUnique({
          where: { id },
          include: { items: true }
        });
      });

      return res.status(201).json({
        success: true,
        data: outflow,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /* =========================================================
   * NOTIFICATIONS
   * ========================================================= */

  async getNotifications(req, res) {
    try {
      const companyId = req.user.companyId;
      const notifications = await prisma.notification.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" }
      });

      return res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      await prisma.notification.updateMany({
        where: { id, companyId },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markMultipleAsRead(req, res) {
    try {
      const { ids } = req.body;
      const companyId = req.user.companyId;

      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({
          success: false,
          message: "ids array is required",
        });
      }

      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          companyId
        },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: "Notifications marked as read",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const companyId = req.user.companyId;
      const { role } = req.query; // optional filter by role string pattern

      const whereClause = { companyId };

      if (role) {
        whereClause.targetRoles = {
          contains: role.toLowerCase()
        };
      }

      await prisma.notification.updateMany({
        where: whereClause,
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ReportsController();
