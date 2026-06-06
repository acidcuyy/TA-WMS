const userQueryConfig = {
  searchableFields: ["name", "email"],
  filterableFields: ["role", "age"],
  relations: {
    store: true,
    warehouses: true,
    company: true,
    transfers: true,
    purchaseRequestPhotos: true,
    transferPhotos: true,
  },
};

export default userQueryConfig;