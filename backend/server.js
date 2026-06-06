import { env } from './src/config/env.js';
import logger from './src/config/logger.js';
import prisma from './src/config/database.js';
import app from './src/app.js';

const startServer = async () => {
    try {
        // Test koneksi dengan database
        await prisma.$connect();
            logger.info('Koneksi database berhasil');

            app.listen(env.PORT, () => {
                logger.info(`Server berjalan di http://localhost:${env.PORT}`);
                logger.info(`Environment: ${env.NODE_ENV}`);
            });
    } catch (error) {
        logger.error('Gagal menjalankan server:', error);
        await prisma.$disconnect();
        process.exit(1)
    }
};


process.on('SIGINT', async () => {
    logger.info('Mematikan server...');
    await prisma.$disconnect();
    logger.info('Koneksi database ditutup');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Mematikan server...');
    await prisma.$disconnect();
    logger.info('Koneksi database ditutup');
    process.exit(0);
});

startServer();