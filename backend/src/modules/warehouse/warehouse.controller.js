import { success } from "zod";
import warehouseService from "./warehouse.service.js";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "./warehouse.validate.js";

class warehouseController {
  async getWarehouse(req, res) {
    try {
      const warehouse = await warehouseService.getWarehouse();

      return res.json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createWarehouse(req, res) {
    try {
      const validateData = createWarehouseSchema.parse(req.body);

      const warehosue = await warehouseService.createWarehouse(validateData);

      return res.status(201).json({
        success: true,
        data: warehosue,
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

  async updateWarehouse(req, res) {
    try {
      const { id } = req.params;
      const validateData = updateWarehouseSchema.parse(req.body);
      const warehosue = await warehouseService.updateWarehouse(
        id,
        validateData,
      );

      return res.status(200).json({
        success: true,
        data: warehosue,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new warehouseController();
