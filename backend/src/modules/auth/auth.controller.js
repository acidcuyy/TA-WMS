import authService from "./auth.service.js";
import prisma from "../../config/database.js";
import { registerSchema, loginSchema, registerCompanySchema } from "./auth.validation.js";

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

  async registerCompany(req, res) {
    try {
      const validatedData = registerCompanySchema.parse(req.body);

      const result = await authService.registerCompany(validatedData);

      return res.status(201).json({
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

  async getCompanyProfile(req, res) {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(404).json({ success: false, message: "Company ID not found in token." });
      }

      const profile = await authService.getCompanyProfile(companyId);
      if (!profile) {
        return res.status(404).json({ success: false, message: "Company profile not found." });
      }

      return res.json({ success: true, data: profile });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateCompanySettings(req, res) {
    try {
      const companyId = req.user.companyId;
      const { autoSync, syncInterval } = req.body;

      if (!companyId) {
        return res.status(404).json({ success: false, message: "Company ID not found in token." });
      }

      const updated = await prisma.companyProfile.update({
        where: { id: companyId },
        data: {
          autoSync: typeof autoSync === 'boolean' ? autoSync : undefined,
          syncInterval: syncInterval ? parseInt(syncInterval, 10) : undefined,
        }
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new AuthController();
