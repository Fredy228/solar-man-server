const paginateItems = (sortedArray, limit, page) => {
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);

  return sortedArray.slice(startIndex, endIndex);
};

module.exports = paginateItems;
