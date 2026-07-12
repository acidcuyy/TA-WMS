import prisma from "../../config/database.js";

class StocksController {
  async getStocks(req, res) {
    try {
      const { branchId } = req.query;
      const companyId = req.user.companyId;

      const whereClause = {};

      if (branchId) {
        whereClause.branchId = branchId;
      }

      // Filter by company branches
      whereClause.branch = {
        companyId
      };

      const stocks = await prisma.warehouseStock.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              sku: true,
              name: true,
              category: true,
              unit: true,
              price: true,
              image: true,
            }
          }
        },
        orderBy: { addedAt: "desc" }
      });

      // Map to frontend expected structure
      const mappedStocks = stocks.map(s => ({
        sku: s.sku,
        name: s.product.name,
        type: s.product.category,
        category: s.product.category,
        qty: s.qty,
        minQty: s.minQty,
        unit: s.product.unit,
        price: s.product.price,
        image: s.product.image,
        branchId: s.branchId,
        addedAt: s.addedAt.toISOString().slice(0, 10),
      }));

      return res.json({
        success: true,
        data: mappedStocks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createStock(req, res) {
    try {
      const { sku, qty, minQty, branchId } = req.body;
      const companyId = req.user.companyId;

      if (!sku || qty === undefined || !branchId) {
        return res.status(400).json({
          success: false,
          message: "sku, qty, and branchId are required",
        });
      }

      // Verify branch belongs to same company
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, companyId }
      });
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found or unauthorized",
        });
      }

      // Verify product exists in same company, or create it if not
      let product = await prisma.product.findFirst({
        where: { sku, companyId }
      });
      if (!product) {
        const { name, type, image } = req.body;
        if (!name || !type) {
          return res.status(404).json({
            success: false,
            message: "Product not found. To auto-create, provide name and type.",
          });
        }
        product = await prisma.product.create({
          data: {
            sku,
            name,
            category: type,
            image: image || null,
            companyId
          }
        });
      }

      // Upsert stock
      const stock = await prisma.warehouseStock.upsert({
        where: {
          sku_branchId: { sku, branchId }
        },
        update: {
          qty: parseInt(qty),
          minQty: minQty !== undefined ? parseInt(minQty) : undefined,
        },
        create: {
          sku,
          qty: parseInt(qty),
          minQty: minQty !== undefined ? parseInt(minQty) : 0,
          branchId,
        },
        include: {
          product: true
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          sku: stock.sku,
          name: stock.product.name,
          type: stock.product.category,
          qty: stock.qty,
          minQty: stock.minQty,
          branchId: stock.branchId,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStock(req, res) {
    try {
      const { sku } = req.params;
      const { branchId, qty, minQty } = req.body;
      const companyId = req.user.companyId;

      if (!branchId || qty === undefined) {
        return res.status(400).json({
          success: false,
          message: "branchId and qty are required",
        });
      }

      // Verify stock exists and belongs to same company
      const existingStock = await prisma.warehouseStock.findFirst({
        where: {
          sku,
          branchId,
          branch: { companyId }
        }
      });

      if (!existingStock) {
        return res.status(404).json({
          success: false,
          message: "Stock item not found",
        });
      }

      // 1. Update Product details (image, name, category)
      const { name, type, image } = req.body;
      if (name || type || image) {
        const updateData = {};
        if (name) updateData.name = name;
        if (type) updateData.category = type;
        if (image) updateData.image = image;
        
        await prisma.product.update({
          where: { sku },
          data: updateData
        });
      }

      // 2. Update WarehouseStock details
      const updatedStock = await prisma.warehouseStock.update({
        where: {
          sku_branchId: { sku, branchId }
        },
        data: {
          qty: parseInt(qty),
          minQty: minQty !== undefined ? parseInt(minQty) : undefined,
        }
      });

      return res.json({
        success: true,
        data: updatedStock,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteStock(req, res) {
    try {
      const { sku, branchId } = req.params;
      const companyId = req.user.companyId;

      // Verify stock belongs to same company
      const existingStock = await prisma.warehouseStock.findFirst({
        where: {
          sku,
          branchId,
          branch: { companyId }
        }
      });

      if (!existingStock) {
        return res.status(404).json({
          success: false,
          message: "Stock item not found",
        });
      }

      await prisma.warehouseStock.delete({
        where: {
          sku_branchId: { sku, branchId }
        }
      });

      return res.json({
        success: true,
        message: "Stock item deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new StocksController();
