const connectedUsers = new Set();

function addUser(userId) {
  connectedUsers.add(userId);
}

function removeUser(userId) {
  connectedUsers.delete(userId);
}

function isUserOnline(userId) {
  return connectedUsers.has(userId);
}

module.exports = {
  addUser,
  removeUser,
  isUserOnline,
};
