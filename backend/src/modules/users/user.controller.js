import userService from "./user.service.js";
import { createUserSchema } from "./user.validation.js";
import prisma from "../../config/database.js";
import bcrypt from "bcrypt";

class UserController {
  async getUsers(req, res) {
    try {
      const companyId = req.user.companyId;
      const users = await userService.getUsers(companyId);

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
      
      // Inject admin's companyId
      validatedData.companyId = req.user.companyId;

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      // Check if email already exists
      if (validatedData.email && validatedData.email.trim() !== "") {
        const existingEmail = await prisma.user.findUnique({
          where: { email: validatedData.email }
        });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email sudah digunakan",
          });
        }
      }

      // Hash password
      validatedData.password = await bcrypt.hash(validatedData.password, 10);

      // Strip undefined/null optional fields (and unknown fields from frontend)
      const allowedFields = [
        "username", "password", "name", "email", "phone", "role",
        "companyId", "branchId", "vehicle", "nomorSim", "alamatDomisili",
        "statusMitra", "joinedAt", "title"
      ];
      const cleanData = {};
      for (const key of allowedFields) {
        if (validatedData[key] !== undefined && validatedData[key] !== null && validatedData[key] !== "") {
          cleanData[key] = validatedData[key];
        }
      }

      const user = await userService.createUser(cleanData);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        const issues = error.issues || error.errors || [];
        return res.status(400).json({
          success: false,
          message: "Validasi gagal: " + issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", "),
          errors: issues,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      // Verify user belongs to same company
      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!targetUser || targetUser.companyId !== companyId) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      return res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async transferUser(req, res) {
    try {
      const { id } = req.params;
      const { branchId } = req.body;
      const companyId = req.user.companyId;

      // Verify user belongs to same company
      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!targetUser || targetUser.companyId !== companyId) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update branchId
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { branchId },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          branchId: true,
        }
      });

      return res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async heartbeat(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      
      const result = await userService.heartbeat(userId);
      return res.json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new UserController();
