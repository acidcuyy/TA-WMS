import prisma from "../../config/database.js";

class UserService {
  async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
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
        age: true,
        role: true,
      },
    });
  }
}

export default new UserService();
