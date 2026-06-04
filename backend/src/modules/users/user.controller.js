import userService from "./user.service.js";
import { createUserSchema, updateUserSchema } from "./user.validation.js";

class UserController {
  async getUsers(req, res) {
    try {
      const users = await userService.getUsers();

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    } 
  }

  async createUser(req, res) {
    try {
      const validatedData = createUserSchema.parse(req.body);

      const user = await userService.createUser(validatedData);

      return res.status(201).json({
        success: true,
        data: user,
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

  async getUserById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id);
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

  async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateUserSchema.parse(req.body);

      const updatedUser = await userService.updateUser(id, validatedData);
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

  async deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedUser = await userService.deleteUser(id);
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
