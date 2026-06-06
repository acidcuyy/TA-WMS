import companyService from "./company.service.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "./company.validation.js";

class CompanyController {
  async getAll(req, res) {
    try {
      const companies = await companyService.findAll(req.body);

      return res.json({
        success: true,
        message: "Company retrieved successfully",
        data: companies.data,
        meta: companies.meta,
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
      const validatedData = createCompanySchema.parse(req.body);

      const company = await companyService.create(validatedData);

      return res.status(201).json({
        success: true,
        data: company,
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
      const company = await companyService.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }
      return res.json({
        success: true,
        data: company,
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
      const validatedData = updateCompanySchema.parse(req.body);

      const updatedCompany = await companyService.update(id, validatedData);
      if (!updatedCompany) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }
      return res.json({
        success: true,
        data: updatedCompany,
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
      const deletedCompany = await companyService.delete(id);
      if (!deletedCompany) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }
      return res.json({
        success: true,
        data: deletedCompany,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CompanyController();
