"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users = [];
const userJoin = (id, username, room) => {
    const user = { id, username, room };
    users.push(user);
    return user;
};
const getCurrentUser = (id) => {
    return users.find((user) => user.id === id);
};
const userLeave = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};
const getRoomUsers = (room) => {
    return users.filter((user) => user.room === room);
};
const userUtils = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
};
exports.default = userUtils;
