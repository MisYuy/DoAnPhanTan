const socket = io('http://localhost:3500');

const loginResult = document.querySelector('.loginResult');

const msgInput = document.querySelector('#ip-message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.message-list');
const chatDisplay = document.querySelector('.chat-display');
const chatter = document.querySelector('.chatter');
const nameRoom = document.querySelector('#name-room');

document.querySelector('.login-wrap').style.display = "flex";
document.querySelector('main').style.display = "none";
document.getElementById('customStyle').href = "authenticate.css";

let username = "";
let curNameRoomSelecting = "";

function login(e) {
    e.preventDefault();
    const username = document.getElementById('usernameLogin').value;
    const password = document.getElementById('passwordLogin').value;

    // Send login information to the server
    socket.emit('login', { username, password });
}

function createRoom(e){
    e.preventDefault();
    const nameRoom = document.getElementById('roomName').value;
    socket.emit('createRoom', {nameRoom, username: username});
}

function sendMessage(e) {
    console.log("Send message " + msgInput.value + " from " + username);
    e.preventDefault();
    if (msgInput.value) {
        socket.emit('message', {
            sender: username,
            text: msgInput.value,
            nameRoom: curNameRoomSelecting
        });
        msgInput.value = '';
    }
    msgInput.focus();
}

function enterRoom(element) {
    const nameRoom = element.getAttribute("name-room");
    console.log("Join Room " + nameRoom + " success");
    socket.emit('joinRoom', {nameRoom: nameRoom, username: username});
}

socket.on("loginResult", ({result, user}) => {
    if(result === true){
        username = user.Username;
        document.querySelector('.login-wrap').style.display = "none";
        document.querySelector('main').style.display = "flex";
        document.querySelector('.Hide').style.display = "none";
        document.getElementById('customStyle').href = "style.css";
    }
    else{
        document.querySelector('#loginResult').innerHTML = `<p style="text-align: center; color: red;">Tài khoản hoặc mật khẩu không chính xác!!!</p>`;
    }
});

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = "";
    const { name, text, time } = data;
    const li = document.createElement('li');
    li.className = 'post';
    if (name === nameInput.value) li.className = 'post post--left';
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right';
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput.value
            ? 'post__header--user'
            : 'post__header--reply'
            }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`;
    }
    document.querySelector('.chat-display').appendChild(li);

    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});


socket.on('userList', ({ users }) => {
    showUsers(users);
});

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms);
});

socket.on('rsSelectRoom', ({ room }) => {
    curNameRoomSelecting = room;
    openRoom(room);
});

socket.on('messagesList', ({ messages }) => {
    console.log("Display Messages: "  + messages.length + "length");
    showMess(messages);
});

function showUsers(users) {
    usersList.textContent = '';
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`;
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ",";
            }
        });
    }
}

function showRooms(rooms) {
    roomList.innerHTML = "";
    if (rooms) {
        rooms.forEach(room => {
            roomList.innerHTML += `<li class="active" name-room="${room}" onclick="enterRoom(this)">
            <a>
                <div class="messenger-icon">
                    <img src="images/Logo.png">
                    <i class="fa fa-circle green"></i>
                </div>
                <div class="messenger-message">
                    <h5 class="message-title">${room}</h5>
                    <div class="message-summery choppOff">Design all task given by Ashwini on top priority.</div>
                </div>
                <span class="date-time">14 min ago</span>
            </a>
        </li>`;
        });
    }
}

function openRoom(room){
    nameRoom.textContent = room;
}

function showMess(messages){
    chatter.innerHTML = "";
    if(messages){
        messages.forEach(mess => {
            if(mess.Sender === "Admin"){
                const color = mess.Type === "In" ? "green" : "red"; 
                chatter.innerHTML += `<div class="chat-wrapper middle" style="margin-left: auto; margin-right: auto; width: 50%; color: ${color}; margin-top: 15px; margin-bottom: 15px;">
                <div class="chatter-title" style="text-align: center;">
                    ${mess.Time}
                </div>
                <div class="chatter-message" style="text-align: center;">
                    <p>${mess.ContentChat}</p>
                </div>
            </div>`;
            }
            else if(mess.Sender !== username){
                chatter.innerHTML += `<div class="chat-wrapper left" style="margin-top: 15px; margin-bottom: 15px;">
                <div class="chatter-title">
                ${mess.Sender}
                </div>
                <div class="chatter-message">
                    <p>${mess.ContentChat}</p>
                </div>
                <div class="time-plate" style="margin-bottom: 20px;">
                    ${mess.Time}
                </div>
            </div>`;
            }
            else{
                chatter.innerHTML += `<div class="chat-wrapper right" style="margin-top: 15px; margin-bottom: 15px;">
                <div class="chatter-title">
                    ${mess.Sender}
                </div>
                <div class="chatter-message">
                    <p>${mess.ContentChat}</p>
                </div>
                <div class="time-plate" style="margin-bottom: 20px;">
                    ${mess.Time}
                </div>
            </div>`;
            }
        })
    }
}