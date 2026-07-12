import prisma from "../../config/database.js";

class UserService {
  async getUsers(companyId) {
    return prisma.user.findMany({
      where: companyId ? { companyId } : undefined,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        companyId: true,
        branchId: true,
        title: true,
        vehicle: true,
        nomorSim: true,
        alamatDomisili: true,
        statusMitra: true,
        joinedAt: true,
        lastLoginAt: true,
        createdAt: true,
        branch: {
          select: {
            name: true,
            type: true,
          }
        }
      },
    });
  }

  async createUser(data) {
    // Central sanitization: never store empty string email (causes unique constraint violation)
    const sanitized = { ...data };
    if (!sanitized.email || sanitized.email.trim() === "") {
      delete sanitized.email;  // Let Prisma use null default
    }

    return prisma.user.create({
      data: sanitized,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        companyId: true,
        branchId: true,
        title: true,
        vehicle: true,
        nomorSim: true,
        alamatDomisili: true,
        statusMitra: true,
        joinedAt: true,
        createdAt: true,
      },
    });
  }

  async heartbeat(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
      select: { id: true, lastLoginAt: true }
    });
  }
}

export default new UserService();
