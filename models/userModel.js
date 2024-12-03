let users = [
  { id: 1, username: "john_doe", password: "hashed_password_1", balance: 0 },
  { id: 2, username: "jane_doe", password: "hashed_password_2", balance: 100 },
];

const findUserById = (userId) => {
  return users.find((user) => user.id === userId);
};

const findUserByUsername = (username) => {
  return users.find((user) => user.username === username);
};

const addUser = (username, password) => {
  const id = users.length > 0 ? users[users.length - 1].id + 1 : 1; // Incremental ID logic
  const newUser = {
    id,
    username,
    password,
    balance: 0,
  };

  users.push(newUser);
  return newUser; // Return the entire user, including the ID
};

const updateUserBalance = (userId, newBalance) => {
  const user = findUserById(userId);
  if (user) {
    user.balance = newBalance;
    return true;
  }
  return false;
};

module.exports = {
  findUserById,
  findUserByUsername,
  addUser,
  updateUserBalance,
};
