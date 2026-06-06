const companyQueryConfig = {
  searchableFields: ["name", "phone"],
  filterableFields: ["isActive"],
  relations: {
    stores: true,
    users: true,
    warehouses: true,
    stockRequests: true,
    products: true,
    purchaseRequests: true,
  },
};

export default companyQueryConfig;
