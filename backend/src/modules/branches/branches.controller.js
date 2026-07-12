import prisma from "../../config/database.js";

class BranchesController {
  async getBranches(req, res) {
    try {
      const companyId = req.user.companyId;
      const branches = await prisma.branch.findMany({
        where: { companyId },
        orderBy: { createdAt: "asc" }
      });

      return res.json({
        success: true,
        data: branches,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createBranch(req, res) {
    try {
      const companyId = req.user.companyId;
      const { name, type, location, phone, picName, status, lat, lng, alamatLengkap, jamOperasional, kapasitas, tipeGudang, kategoriToko, pemilik } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Name and type are required",
        });
      }

      const branch = await prisma.branch.create({
        data: {
          name,
          type,
          location,
          alamatLengkap,
          jamOperasional,
          kapasitas,
          tipeGudang,
          kategoriToko,
          pemilik,
          phone,
          picName,
          status: status || "Active",
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          companyId,
        }
      });

      return res.status(201).json({
        success: true,
        data: branch,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateBranch(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const { name, type, location, phone, picName, status, lat, lng, alamatLengkap, jamOperasional, kapasitas, tipeGudang, kategoriToko, pemilik } = req.body;

      // Verify branch belongs to same company
      const existingBranch = await prisma.branch.findFirst({
        where: { id, companyId }
      });

      if (!existingBranch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      const updatedBranch = await prisma.branch.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          type: type !== undefined ? type : undefined,
          location: location !== undefined ? location : undefined,
          alamatLengkap: alamatLengkap !== undefined ? alamatLengkap : undefined,
          jamOperasional: jamOperasional !== undefined ? jamOperasional : undefined,
          kapasitas: kapasitas !== undefined ? kapasitas : undefined,
          tipeGudang: tipeGudang !== undefined ? tipeGudang : undefined,
          kategoriToko: kategoriToko !== undefined ? kategoriToko : undefined,
          pemilik: pemilik !== undefined ? pemilik : undefined,
          phone: phone !== undefined ? phone : undefined,
          picName: picName !== undefined ? picName : undefined,
          status: status !== undefined ? status : undefined,
          lat: lat !== undefined ? (lat ? parseFloat(lat) : null) : undefined,
          lng: lng !== undefined ? (lng ? parseFloat(lng) : null) : undefined,
        }
      });

      return res.json({
        success: true,
        data: updatedBranch,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteBranch(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      // Verify branch belongs to same company
      const existingBranch = await prisma.branch.findFirst({
        where: { id, companyId }
      });

      if (!existingBranch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      await prisma.branch.delete({
        where: { id }
      });

      return res.json({
        success: true,
        message: "Branch deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new BranchesController();
