import prisma from "../../config/database.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import userService from "../users/user.service.js";
import { warnOnce } from "../../../generated/prisma/runtime/client.js";

class AuthService {
  async register(data) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userService.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  }

  async login(data) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      companiesId: user.companiesId,
      storeId: user.storeId,
      companiesId: user.companiesId,
      storeId: user.storeId,
      warehouseId: user.warehouseId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companiesId: user.companiesId,
        storeId: user.storeId,
        warehouseId: user.warehouseId,
      },
    };
  }
}

export default new AuthService();
