import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";

async function main() {
    const existing = await prisma.user.findUnique({
        where: {
            email: "superadmin@gmail.com",
        },
    });

    if (existing) {
        console.log("Super admin already exist");
        return;
    }

    const hashedPassword = await bcrypt.hash("superadmin123", 10);

    await prisma.user.create({
        data: {
            name: "Super Admin",
            email: "superadmin@gmail.com",
            password: hashedPassword,
            role: "SUPER_ADMIN",
        },
    });

    console.log("Super admin create");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });