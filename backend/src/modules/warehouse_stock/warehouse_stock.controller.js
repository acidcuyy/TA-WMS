import warehouseStockService from "./warehouse_stock.service.js";
import {
  createWarehouseStockSchema,
  updateWarehouseStockSchema,
} from "./warehouse_stock.validate.js";

class WarehouseStockController {
  async getAll(req, res) {
    try {
      const warehouseStocks = await warehouseStockService.findAll(req.body);
      return res.json({
        success: true,
        message: "Warehouse Stocks retrieved successfully",
        data: warehouseStocks.data,
        meta: warehouseStocks.meta,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const validatedData = createWarehouseStockSchema.parse(req.body);
      const warehouseStock = await warehouseStockService.create(validatedData);
      return res.status(201).json({
        success: true,
        data: warehouseStock,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const warehouseStock = await warehouseStockService.findById(id);
      if (!warehouseStock) {
        return res.status(404).json({
          success: false,
          message: "Warehouse Stock not found",
        });
      }
      return res.json({
        success: true,
        data: warehouseStock,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateWarehouseStockSchema.parse(req.body);
      const updatedWarehouseStock = await warehouseStockService.update(
        id,
        validatedData,
      );
      if (!updatedWarehouseStock) {
        return res.status(404).json({
          success: false,
          message: "Warehouse Stock not found",
        });
      }
      return res.json({
        success: true,
        data: updatedWarehouseStock,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedWarehouseStock = await warehouseStockService.delete(id);
      if (!deletedWarehouseStock) {
        return res.status(404).json({
          success: false,
          message: "Warehouse Stock not found",
        });
      }
      return res.json({
        success: true,
        data: deletedWarehouseStock,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new WarehouseStockController();
