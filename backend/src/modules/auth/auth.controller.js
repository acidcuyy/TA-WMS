import authService from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

class AuthController {
  async register(req, res) {
    try {
      const validatedData = registerSchema.parse(req.body);

      const user = await authService.register(validatedData);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await authService.login(validatedData);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AuthController();