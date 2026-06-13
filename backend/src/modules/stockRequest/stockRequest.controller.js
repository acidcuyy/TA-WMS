import { success } from "zod";
import stockRequestService from "./stockRequest.service.js";
import {
  createRequestStoreSchema,
  updateRequestStoreSchema,
} from "./stockRequest.validate.js";

class stockRequestController {
  async getAll(req, res) {
    try {
      const stockRequests = await stockRequestService.findAll(req.body);

      return res.json({
        success: true,
        data: stockRequests.data,
        meta: stockRequests.meta,
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
      const validateData = createRequestStoreSchema.parse(req.body);

      const stockRequest = await stockRequestService.create({
        ...validateData,
        companiesId: req.user.companiesId,
      });

      console.log(validateData);

      return res.status(201).json({
        success: true,
        data: stockRequest,
      });
    } catch (error) {
      console.log(error.message);
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: error.issue[0].message,
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

      const stockRequest = await stockRequestService.getById(id);

      if (!stockRequest) {
        return res.status(404).json({
          success: false,
          message: "Stock Request not found",
        });
      }
      return res.json({
        success: true,
        data: stockRequest,
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
      const validateData = updateRequestStoreSchema.parse(req.body);
      const stockRequest = await stockRequestService.update(id, validateData);
      return res.json({
        success: true,
        data: stockRequest,
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
      const stockRequest = await stockRequestService.delete(id);
      if (!stockRequest) {
        return res.status(404).json({
          success: false,
          message: "Stock Request not found",
        });
      }
      return res.json({
        success: true,
        data: stockRequest,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new stockRequestController();
