import userService from "./user.service.js";
import { createUserSchema } from "./user.validation.js";

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
}

export default new UserController();
