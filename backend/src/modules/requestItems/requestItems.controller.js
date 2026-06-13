import { success } from "zod";
import requestItemsService from "./requestItems.service.js";
import {
  createRequestItems,
  updateRequestItems,
} from "./requestItems.validate.js";

class requestItemsController {
  async getAll(req, res) {
    try {
      const requestItems = await requestItemsService.findAll(req.body);

      return res.json({
        success: true,
        data: requestItems.data,
        meta: requestItems.meta,
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
      const validateData = createRequestItems.parse(req.body);

      const requestItems = await requestItemsService.create(validateData);

      return res.status(201).json({
        success: true,
        data: requestItems,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.issue,
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

      const item = await requestItemsService.getById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Stock request not found",
        });
      }

      return res.json({
        success: true,
        data: item,
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
      const validateData = updateRequestItems.parse(req.body);
      const requestItems = await requestItemsService.update(id, validateData);

      return res.json({
        success: true,
        data: requestItems,
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
      const requestItems = await requestItemsService.delete(id);

      if (!requestItems) {
        return res.status(404).json({
          success: false,
          message: "Request items not found",
        });
      }
      return res.json({
        success: true,
        data: requestItems,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new requestItemsController();
