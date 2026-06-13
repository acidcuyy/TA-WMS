import transferService from "./transfer.service.js";
import {
  createTransferSchema,
  updateTransferSchema,
} from "./transfer.validate.js";

class TransferController {
  async getAll(req, res) {
    try {
      const transfers = await transferService.findAll(req.body);
      return res.json({
        success: true,
        message: "Transfers retrieved successfully",
        data: transfers.data,
        meta: transfers.meta,
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
      const validatedData = createTransferSchema.parse(req.body);
      const transfer = await transferService.create(validatedData);
      return res.status(201).json({
        success: true,
        data: transfer,
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
      const transfer = await transferService.findById(id);
      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: "Transfer not found",
        });
      }
      return res.json({
        success: true,
        data: transfer,
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
      const validatedData = updateTransferSchema.parse(req.body);
      const updatedTransfer = await transferService.update(id, validatedData);
      if (!updatedTransfer) {
        return res.status(404).json({
          success: false,
          message: "Transfer not found",
        });
      }
      return res.json({
        success: true,
        data: updatedTransfer,
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
      const deleted = await transferService.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Transfer not found",
        });
      }
      return res.json({
        success: true,
        message: "Transfer deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new TransferController();
