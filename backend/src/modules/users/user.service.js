import prisma from "../../config/database.js";

class UserService {
  async getUsers() {
    return prisma.user.findMany({
      where: {
        isActived: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
    });
  }

  async createUser(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
    });
  }

  async getUserById(id) {
    return prisma.user.findUnique({
      where: {id, isActived: true},
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
    });
  }

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id, isActived: true },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
    });
  }

  async deleteUser(id) {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
    });
  }
}

export default new UserService();
