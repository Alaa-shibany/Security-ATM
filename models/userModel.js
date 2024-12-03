const users = [];

const addUser = (user) => {
  users.push(user);
};

const findUserByUsername = (username) => {
  return users.find((user) => user.username === username);
};

const findUserByToken = (token) => {
  return users.find((user) => user.token === token);
};

const getAllUsers = () => users;

module.exports = {
  addUser,
  findUserByUsername,
  findUserByToken,
  getAllUsers,
};
