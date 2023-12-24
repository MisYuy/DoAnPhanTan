import express from 'express';
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';


// Assuming that database.js is in the same directory as server.mjs
import { loginMethod, checkJoinRoom, createRoom, joinRoom, getAllRooms, getRoomByName, insertMess, getAllMessOfRoom } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const ADMIN = "Admin";

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

// state 
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray;
    }
};

const TYPE_MESS = {
    NORMAL: "Normal",
    IN: "In",
    OUT: "Out"
};

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    // When user disconnects - to all others 
    socket.on('disconnect', () => {
        const user = getUser(socket.id);
        userLeavesApp(socket.id);

        if (user) {
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`));

            io.to(user.room).emit('userList', {
                users: getUsersInRoom(user.room)
            });

            io.emit('roomList', {
                rooms: getAllActiveRooms()
            });
        }

        console.log(`User ${socket.id} disconnected`);
    });

    socket.on('login', async ({ username, password }) => {
        try {
            const user = await loginMethod(username, password);
            const result = user !== undefined;
            socket.emit("loginResult", {result, user});
            let rooms = await getAllRooms();
            for (let room of rooms) {
                room.isJoined = (await checkJoinRoom(room.NameRoom, username)) !== undefined;
            }
            socket.emit('roomList', {
                rooms: rooms
            });
        } catch (error) {
            console.error('Error during login:', error);
            socket.emit("loginResult", {result});
        }
    });

    socket.on('selectRoom', async ({ nameRoom, username }) => {
        try {
            const result = await checkJoinRoom(nameRoom, username);
            const check = result !== undefined;
            socket.emit("rsSelectRoom", {check});
        } catch (error) {
            console.error('Error during login:', error);
            socket.emit("rsSelectRoom", {check});
        }
    });


    socket.on('createRoom', async ({nameRoom, username, password, title}) => {
        try {
            const user = activateUser(socket.id, username, nameRoom);
            // join room 
            socket.join(user.room);
            const myRoom = await createRoom(nameRoom, password, title);
            await joinRoom(nameRoom, username);
            let rooms = await getAllRooms();
            for (let room of rooms) {
                room.isJoined = (await checkJoinRoom(room.NameRoom, username)) !== undefined;
            }
            io.emit('roomList', {
                rooms: rooms
            });
            socket.emit("rsJoinRoom", {room: myRoom});
            const mess = buildMsg(ADMIN, `${username} vừa tham gia vào cuộc trò chuyện.`, TYPE_MESS.IN);
            await insertMess(nameRoom, mess.name, mess.text, mess.time, mess.type);
            const allMessInRoom = await getAllMessOfRoom(nameRoom);
            socket.emit("messagesList", {messages: allMessInRoom});
        } catch (error) {
            console.error('Error create room:', error);
        }
    });

    socket.on('joinRoom', async ({nameRoom, username}) => {
        try {
            const user = activateUser(socket.id, username, nameRoom);
            // join room 
            socket.join(user.room);
            const checkJoinedRoom = await checkJoinRoom(nameRoom, username);
            if(checkJoinedRoom === undefined) {
                await joinRoom(nameRoom, username);
                const mess = buildMsg(ADMIN, `${username} vừa tham gia vào cuộc trò chuyện.`, TYPE_MESS.IN);
                await insertMess(nameRoom, mess.name, mess.text, mess.time, mess.type);
            }
            const room = await getRoomByName(nameRoom);
            socket.emit("rsJoinRoom", {room: room});
            const allMessInRoom = await getAllMessOfRoom(nameRoom);
            io.to(nameRoom).emit("messagesList", {messages: allMessInRoom});
        } catch (error) {
            console.error('Error create room:', error);
        }
    });

    // Listening for a message event 
    socket.on('message', async ({ sender, text, nameRoom }) => {
        try {
            const mess = buildMsg(sender, text, TYPE_MESS.NORMAL);
            await insertMess(nameRoom, mess.name, mess.text, mess.time, mess.type);
            const allMessInRoom = await getAllMessOfRoom(nameRoom);
            io.to(nameRoom).emit("messagesList", {messages: allMessInRoom});
        } catch (error) {
            console.error('Error send message:', error);
        }
    });

    socket.on('searchRoom', async ({ searchValue }) => {
        try {
            let rooms = await getAllRooms();
            rooms = filterRoomByName(rooms, searchValue);
            socket.emit('roomList', {
                rooms: rooms
            });
        } catch (error) {
            console.error('Error search room:', error);
        }
    });
});

function buildMsg(name, text, type) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date()),
        type
    };
}

// User functions 
function activateUser(id, name, room) {
    const user = { id, name, room };
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
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


function filterRoomByName(rooms, searchValue){
    var filteredRooms = rooms.filter(room => {
        return room.NameRoom.toLowerCase().includes(searchValue.toLowerCase());
    })
    return filteredRooms;
}