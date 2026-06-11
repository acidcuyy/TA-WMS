import userService from "./user.service.js";
import { createUserSchema, updateUserSchema } from "./user.validation.js";

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.findAll(req.body);

      return res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users.data,
        meta: users.meta,
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
      const { role, companiesId } = req.user;

      const validatedData = createUserSchema.parse(req.body);

      if (role === "ADMIN") {
        validatedData.companiesId = companiesId;
      }

      if (role === "ADMIN" && validatedData.role === "SUPER_ADMIN") {
        return sendError(req, "ADMIN tidak boleh membuat SUPER_ADMIN", 403);
      }

      const user = await userService.create(validatedData);

      return sendSuccess(res, "User berhasil dibuat", user, 201);
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
      const user = await userService.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.json({
        success: true,
        data: user,
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
      const validatedData = updateUserSchema.parse(req.body);

      const updatedUser = await userService.update(id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.json({
        success: true,
        data: updatedUser,
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
      const deletedUser = await userService.delete(id);
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.json({
        success: true,
        data: deletedUser,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new UserController();
