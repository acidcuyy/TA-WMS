import stockRequestService from "./stockRequest.service.js";
import stockRequest from "./stockRequest.service.js";
import { 
    createRequestItemSchema,
} from "./stockRequest.validate.js";

class stockRequestController {
    async getAll(req, res) {
        try {
            const stockRequests = await stockRequestService.findAll(req.body);

            return res.json({
                success: true,
                data: stockRequests.data,
                meta: stockRequests.meta,
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
            console.log(req.user);
            const validatedData = createRequestItemSchema.parse(req.body);
            const stockRequest = await stockRequestService.create(req.user.storeId, req.user.companiesId, validatedData);
            return res.status(201).json({
                success: true,
                data: stockRequest,
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

            let storeId = null;

            // if (req.user.role === "TOKO") {
            //     storeId = req.user.storeId;
            // }

            // if (req.user.role === "ADMIN") {
            //     storeId = validateData.storeId;
            // }
            
            const stockRequest = await stockRequestService.getById(id);
            if (!stockRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Stock Request not found",
                });
            }
            return res.json({
                success: true,
                data: stockRequest,
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
            const validateData = updateStockRequestSchema.parse(req.body);
            const stockRequest = await stockRequestService.update(id, validateData);
            return res.json({
                success: true,
                data: stockRequest,
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
            const stockRequest = await stockRequestService.delete(id);
            if (!stockRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Stock Request not found",
                });
            }
            return res.json({
                success: true,
                data: stockRequest,
            });
        } catch (error) {             return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new stockRequestController();