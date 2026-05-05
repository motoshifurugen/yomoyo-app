const mockGetFirestore = jest.fn(() => ({}));
const mockCollection = jest.fn(() => ({ type: 'collRef' }));
const mockDoc = jest.fn(() => ({ type: 'docRef' }));
const mockSetDoc = jest.fn(() => Promise.resolve());
const mockUpdateDoc = jest.fn(() => Promise.resolve());
const mockGetDocs = jest.fn(() => Promise.resolve({ docs: [] }));
const mockWhere = jest.fn(() => ({ type: 'whereConstraint' }));
const mockOrderBy = jest.fn(() => ({ type: 'orderByConstraint' }));
const mockLimit = jest.fn(() => ({ type: 'limitConstraint' }));
const mockStartAfter = jest.fn(() => ({ type: 'startAfterConstraint' }));
const mockQuery = jest.fn((...args) => args[0]);
const mockUnsubscribe = jest.fn();
const mockOnSnapshot = jest.fn(() => mockUnsubscribe);
const mockServerTimestamp = jest.fn(() => ({ _isServerTimestamp: true }));
const mockGetDoc = jest.fn(() =>
  Promise.resolve({ exists: () => false, data: () => undefined }),
);
const mockDeleteDoc = jest.fn(() => Promise.resolve());
const mockRunTransaction = jest.fn(async (_db, callback) => {
  const tx = {
    get: jest.fn(() =>
      Promise.resolve({ exists: () => false, data: () => undefined }),
    ),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return callback(tx);
});

module.exports = {
  getFirestore: mockGetFirestore,
  collection: mockCollection,
  doc: mockDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
  query: mockQuery,
  onSnapshot: mockOnSnapshot,
  serverTimestamp: mockServerTimestamp,
  getDoc: mockGetDoc,
  runTransaction: mockRunTransaction,
};
