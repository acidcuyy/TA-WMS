import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object ({
    //Server
    NODE_ENV: z.enum(['development', 'staging', 'test']).default('development'),
    PORT: z.string().default('3000'),

    //Database
    DATABASE_URL: z.string({
        required_error: 'DATABASE_URL'
    }),

    //JWT
    JWT_SECRET: z.string({
        required_error: 'JWT_SECRET'
    }).min(32, 'JWT_SECRET'),
    JWT_EXPRESS_IN: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Environment variabel tidak valid');
    parsed.error.issues.forEach((issues)=> {
        console.error(` -${issues.path[0]}: ${issues.message}`);
    });
    process.exit(1);
}

export const env = parsed.data;