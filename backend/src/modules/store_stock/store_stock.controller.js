import StoreStockService from "./store_stock.service.js";
import {
  createStoreStockSchema,
  updateStoreStockSchema,
} from "./store_stock.validate.js";

class StoreStockController {
  async getAll(req, res) {
    try {
      const storeStocks = await StoreStockService.findAll(req.body);
      return res.json({
        success: true,
        message: "Store Stocks retrieved successfully",
        data: storeStocks.data,
        meta: storeStocks.meta,
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
      const validatedData = createStoreStockSchema.parse(req.body);
      const storeStock = await StoreStockService.create(validatedData);
      return res.status(201).json({
        success: true,
        data: storeStock,
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
      const storeStock = await StoreStockService.findById(id);
      if (!storeStock) {
        return res.status(404).json({
          success: false,
          message: "Store Stock not found",
        });
      }
      return res.json({
        success: true,
        data: storeStock,
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
      const validatedData = updateStoreStockSchema.parse(req.body);
      const updatedStoreStock = await StoreStockService.update(
        id,
        validatedData,
      );
      if (!updatedStoreStock) {
        return res.status(404).json({
          success: false,
          message: "Store Stock not found",
        });
      }

      return res.json({
        success: true,
        data: updatedStoreStock,
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
      const deleted = await StoreStockService.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Store Stock not found",
        });
      }
      return res.json({
        success: true,
        data: deleted,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new StoreStockController();
