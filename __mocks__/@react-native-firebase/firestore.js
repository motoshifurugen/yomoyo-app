const mockGetFirestore = jest.fn(() => ({}));
const mockCollection = jest.fn(() => ({ type: 'collRef' }));
const mockDoc = jest.fn(() => ({ type: 'docRef' }));
const mockSetDoc = jest.fn(() => Promise.resolve());
const mockUpdateDoc = jest.fn(() => Promise.resolve());
const mockWhere = jest.fn(() => ({ type: 'whereConstraint' }));
const mockOrderBy = jest.fn(() => ({ type: 'orderByConstraint' }));
const mockQuery = jest.fn((...args) => args[0]);
const mockUnsubscribe = jest.fn();
const mockOnSnapshot = jest.fn(() => mockUnsubscribe);
const mockServerTimestamp = jest.fn(() => ({ _isServerTimestamp: true }));

module.exports = {
  getFirestore: mockGetFirestore,
  collection: mockCollection,
  doc: mockDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  where: mockWhere,
  orderBy: mockOrderBy,
  query: mockQuery,
  onSnapshot: mockOnSnapshot,
  serverTimestamp: mockServerTimestamp,
  __mocks: {
    mockGetFirestore,
    mockCollection,
    mockDoc,
    mockSetDoc,
    mockUpdateDoc,
    mockWhere,
    mockOrderBy,
    mockQuery,
    mockUnsubscribe,
    mockOnSnapshot,
    mockServerTimestamp,
  },
};
