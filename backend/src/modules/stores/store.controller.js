import storeService from "./store.service.js";
import {
    createStoreSchema,
    updateStoreSchema,
} from "./store.validate.js";

class storeController {
    async getAll(req, res) {
        try {
            const stores = await storeService.findAll(req.body);

            return res.json({
                success: true,
                data: stores.data,
                meta: stores.meta,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async create(req, res) {
        try {
            const validatedData = createStoreSchema.parse(req.body);

            const store = await storeService.create(validatedData);

            return res.status(201).json({
                success: true,
                data: store,
            });
        } catch (error) {
            if (error.name === "ZodError") {
                return res.status(400).json({
                    success: false,
                    errors: error.errors,
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const store = await storeService.getByid(id);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: "Store not found",
                });
            }
            return res.json({
                success: true,
                data: store,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validatedData = updateStoreSchema.parse(req.body);

            const store = await storeService.update(id, validatedData);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: "Store not found",
                });
            }
            return res.json({
                success: true,
                data: store,
            });
        } catch (error) {
            if (error.name === "ZodError") {
                return res.status(400).json({
                    success: false,
                    errors: error.errors,
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const store = await storeService.delete(id);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: "Store not found",
                });
            }
            return res.json({
                success: true,
                data: store,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new storeController();