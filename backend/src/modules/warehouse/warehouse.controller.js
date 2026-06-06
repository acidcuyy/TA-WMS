import warehouseService from "./warehouse.service.js";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "./warehouse.validate.js";

class warehouseController {
  async getAll(req, res) {
    try {
      const warehouses = await warehouseService.findAll(req.body);

      return res.json({
        success: true,
        data: warehouses.data,
        meta: warehouses.meta,
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
      const validatedData = createWarehouseSchema.parse(req.body);

      const warehouse = await warehouseService.create(validatedData);

      return res.status(201).json({
        success: true,
        data: warehouse,
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
      const warehouse = await warehouseService.getByid(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }
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

  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateWarehouseSchema.parse(req.body);

      const updateWarehouse = await warehouseService.update(id, validatedData);
      if (!updateWarehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }

      return res.json({
        success: true,
        data: updateWarehouse,
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

  async deleted(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedWarehouse = await warehouseService.delete(id);
      if (!deletedWarehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }
      return res.json({
        success: true,
        data: deletedWarehouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new warehouseController();