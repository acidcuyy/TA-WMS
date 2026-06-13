const requestItemsModelConfig = {
  filterableFields: ["quantity"],
  relation: {
    product: true,
    stockRequest: true,
  },
};

export default requestItemsModelConfig;
