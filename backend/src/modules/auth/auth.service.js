import prisma from "../../config/database.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import userService from "../users/user.service.js";

class AuthService {
  async register(data) {
    // Check username
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    // Sanitize: treat empty string email as no email
    const email = data.email && data.email.trim() !== "" ? data.email : undefined;

    // Check email (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Build clean data without empty email
    const { email: _email, ...restData } = data;
    const userData = email ? { ...restData, email, password: hashedPassword } : { ...restData, password: hashedPassword };

    const user = await userService.createUser(userData);

    return user;
  }

  async registerCompany(data) {
    const { company, admin } = data;

    // Check admin username
    const existingAdmin = await prisma.user.findUnique({
      where: { username: admin.username },
    });
    if (existingAdmin) {
      throw new Error("Admin username already exists");
    }

    // Start database transaction
    return prisma.$transaction(async (tx) => {
      // 1. Create company profile
      const newCompany = await tx.companyProfile.create({
        data: {
          name: company.name,
          industry: company.industry,
          nib: company.nib,
          address: company.address,
          logo: company.logo,
          document: company.document,
        },
      });

      // 2. Hash admin password
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // 3. Create admin user
      const newAdmin = await tx.user.create({
        data: {
          username: admin.username,
          name: admin.name,
          email: admin.email && admin.email.trim() !== "" ? admin.email : undefined,
          title: admin.title,
          phone: admin.phone,
          password: hashedPassword,
          role: "ADMIN",
          companyId: newCompany.id,
          joinedAt: new Date().toISOString().slice(0, 10),
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          title: true,
          phone: true,
          role: true,
          companyId: true,
          joinedAt: true,
        }
      });

      return {
        company: newCompany,
        admin: newAdmin,
      };
    });
  }

  async login(data) {
    const { identifier, password } = data;

    // Find by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ]
      },
      include: {
        branch: true
      }
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      branchId: user.branchId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        companyId: user.companyId,
        branchId: user.branchId,
        branchName: user.branch ? user.branch.name : null,
        branchType: user.branch ? user.branch.type : null,
        joinedAt: user.joinedAt,
      },
    };
  }

  async getCompanyProfile(companyId) {
    return prisma.companyProfile.findUnique({
      where: { id: companyId }
    });
  }
}

export default new AuthService();
