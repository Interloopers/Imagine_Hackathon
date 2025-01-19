import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// State to manage users
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray;
    },
};

// Functions for managing users and messages
function buildMsg(name, text) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat("default", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        }).format(new Date()),
    };
}

function activateUser(id, name, room) {
    const user = { id, name, room };
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user,
    ]);
    return user;
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    );
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id);
}

function getUsersInRoom(room) {
    return UsersState.users.filter(user => user.room === room);
}

function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)));
}

// Chat server setup
export function initializeChatServer(server) {
    const io = new Server(server, {
        cors: {
    origin: "http://localhost:5173", // Allowed origin
    methods: ["GET", "POST"], // Allowed methods
  },
    });

    io.on("connection", socket => {
        console.log(`User ${socket.id} connected`);
        socket.emit("message", buildMsg("Admin", "Welcome to Chat App!"));

        socket.on("enterRoom", ({ name, room }) => {
            const prevRoom = getUser(socket.id)?.room;
            if (prevRoom) {
                socket.leave(prevRoom);
                io.to(prevRoom).emit("message", buildMsg("Admin", `${name} has left the room`));
            }

            const user = activateUser(socket.id, name, room);
            if (prevRoom) {
                io.to(prevRoom).emit("userList", { users: getUsersInRoom(prevRoom) });
            }

            socket.join(user.room);
            socket.emit("message", buildMsg("Admin", `You have joined the ${user.room} chat room`));
            socket.broadcast.to(user.room).emit("message", buildMsg("Admin", `${user.name} has joined the room`));
            io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
            io.emit("roomList", { rooms: getAllActiveRooms() });
        });

        socket.on("disconnect", () => {
            const user = getUser(socket.id);
            userLeavesApp(socket.id);

            if (user) {
                io.to(user.room).emit("message", buildMsg("Admin", `${user.name} has left the room`));
                io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
                io.emit("roomList", { rooms: getAllActiveRooms() });
            }

            console.log(`User ${socket.id} disconnected`);
        });

        socket.on("message", ({ name, text }) => {
            const room = getUser(socket.id)?.room;
            if (room) {
                io.to(room).emit("message", buildMsg(name, text));
            }
        });

        socket.on("activity", name => {
            const room = getUser(socket.id)?.room;
            if (room) {
                socket.broadcast.to(room).emit("activity", name);
            }
        });
    });
}
