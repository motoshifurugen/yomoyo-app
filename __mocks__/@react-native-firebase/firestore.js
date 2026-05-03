const mockSet = jest.fn(() => Promise.resolve());
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockUnsubscribe = jest.fn();
const mockOnSnapshot = jest.fn(() => mockUnsubscribe);
const mockOrderBy = jest.fn(() => ({ onSnapshot: mockOnSnapshot }));
const mockWhere = jest.fn(() => ({ orderBy: mockOrderBy }));
const mockCollection = jest.fn(() => ({
  doc: mockDoc,
  where: mockWhere,
}));

const firestore = jest.fn(() => ({ collection: mockCollection }));
firestore.FieldValue = {
  serverTimestamp: jest.fn(() => ({ _isServerTimestamp: true })),
};

firestore.__mocks = {
  mockSet,
  mockDoc,
  mockUnsubscribe,
  mockOnSnapshot,
  mockOrderBy,
  mockWhere,
  mockCollection,
};

module.exports = firestore;
module.exports.default = firestore;
