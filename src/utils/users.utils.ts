import { User } from "../interfaces/user.interface";

const users: User[] = [];

const userJoin = (id: string, username: string, room: string) => {
  const user: User = { id, username, room };
  users.push(user);
  return user;
};

const getCurrentUser = (id: string) => {
  return users.find((user) => user.id === id);
};

const userLeave = (id: string) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getRoomUsers = (room: string) => {
  return users.filter((user) => user.room === room);
};

const userUtils = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};

export default userUtils;
