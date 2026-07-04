import prisma from '../config/database.js';

export const generateCode = async (prefix, model, fieldName = 'code') => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const dateStr = `${year}${month}${day}`;
    const pattern = `${prefix}-${dateStr}-%`;

    // Hitung berapa kode yang sudah ada hari ini
    const count = await prisma[model].count({
        where: {
            [fieldName]: {
                startsWith: `${prefix}-${dateStr}-`,
            },
        },
    });

    const sequence = String(count + 1).padStart(3, '0');

    return `${prefix}-${dateStr}-${sequence}`;
}