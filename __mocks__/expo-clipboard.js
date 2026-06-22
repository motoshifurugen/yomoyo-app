// Manual mock for expo-clipboard used by Jest (see moduleNameMapper in package.json).
const setStringAsync = jest.fn().mockResolvedValue(true);

module.exports = {
  setStringAsync,
};
