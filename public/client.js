const socket = io('http://192.168.1.6:3500');

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
let curNameRoomJoined = "";
let curNameRoomSelecting = "";
let curElementRoomSelecting;


//#region ---------- FUNCTION HANDLE LOGIC ----------

function login(e) {
    e.preventDefault();
    const username = document.getElementById('usernameLogin').value;
    const password = document.getElementById('passwordLogin').value;

    // Send login information to the server
    socket.emit('login', { username, password });
}

function register(e) {
    e.preventDefault();
    const username = document.getElementById('userRegister').value;
    const password = document.getElementById('passRegister').value;
    const repass = document.getElementById('repassRegister').value;
    const email = document.getElementById('emailRegister').value;

    if (username && password && repass && email && password === repass) {
        // Send login information to the server
        socket.emit('register', { username, password, email });
    }
    else {
        const message = document.getElementById('registerResult');
        let mess = '';
        if (!username || !password || !repass || !email) {
            mess = "NHẬP ĐẦY ĐỦ THÔNG TIN!";
        }
        else if (password !== repass) {
            mess = "XÁC NHẬN LẠI MẬT KHẨU!";
        }
        message.textContent = mess;
        message.style.color = 'red';
    }
}

function createRoom(e) {
    e.preventDefault();
    const nameRoom = document.getElementById('roomName').value;
    const password = document.getElementById('roomPassword').value;
    const title = document.getElementById('roomTitle').value;
    socket.emit('createRoom', { nameRoom, username: username, password, title: title });
    document.getElementById('createRoomForm').reset();
}

function sendMessage(e) {
    console.log("Send message " + msgInput.value + " from " + username);
    e.preventDefault();
    if (msgInput.value) {
        socket.emit('message', {
            sender: username,
            text: msgInput.value,
            nameRoom: curNameRoomJoined
        });
        msgInput.value = '';
    }
    msgInput.focus();
}

function selectRoom(element) {
    const nameRoom = element.getAttribute('name-room');
    socket.emit('selectRoom', { nameRoom: nameRoom, username: username });
    curNameRoomSelecting = nameRoom;
    if (curElementRoomSelecting) curElementRoomSelecting.className = "read";
    else document.getElementById('non-select').style.display = "none";
    curElementRoomSelecting = element;
    curElementRoomSelecting.className = "active";
}

function joinRoom(e) {
    if (e) e.preventDefault();
    document.getElementById('joinRoomForm').reset();
    socket.emit('joinRoom', { nameRoom: curNameRoomSelecting, username: username });
}

function searchRoom(searchValue) {
    socket.emit('searchRoom', { searchValue });
}

//#endregion

//#region ---------- RESPONSE FROM SERVER ----------

socket.on("loginResult", ({ result, user }) => {
    if (result === true) {
        username = user.Username;
        document.querySelector('.login-wrap').style.display = "none";
        document.querySelector('main').style.display = "flex";
        document.querySelector('.Hide').style.display = "none";
        document.getElementById('customStyle').href = "style.css";
    }
    else {
        document.querySelector('#loginResult').innerHTML = `<p style="text-align: center; color: red;">Tài khoản hoặc mật khẩu không chính xác!!!</p>`;
    }
});

socket.on("registerCheckAccountResult", ({result}) => {
    console.log(result);
    if (result === true) {
        const message = document.getElementById('registerResult');
        message.textContent = 'USER ĐÃ TỒN TẠI!';
        message.style.color = 'red';
    }
});

socket.on("registerResult", ({result}) => {
    console.log(result);
    if (result === true) {
        const message = document.getElementById('registerResult');
        message.textContent = 'ĐĂNG KÝ THÀNH CÔNG!';
        message.style.color = 'green';
    }
});

socket.on('userList', ({ users }) => {
    showUsers(users);
});

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms);
});


socket.on('rsSelectRoom', ({ check }) => {
    if (check !== true) {
        openJoinRoomPopup();
    }
    else {
        joinRoom(null);
    }
});

socket.on('rsJoinRoom', ({ room }) => {
    curNameRoomJoined = room.NameRoom;
    openRoom(room);
});

socket.on('messagesList', ({ messages }) => {
    showMess(messages);
});

//#endregion 

//#region ---------- UI HANDLE ----------

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
            console.log(`${room.NameRoom} + ${room.isJoined}`);
            roomList.innerHTML += `<li class="read" name-room="${room.NameRoom}" onclick="selectRoom(this)">
            <a>
                <div class="messenger-icon">
                    <img src="images/Logo.png">
                    <i class="fa fa-circle green"></i>
                </div>
                <div class="messenger-message">
                    <h5 class="message-title">${room.NameRoom}</h5>
                    <div class="message-summery choppOff">${room.Title}</div>
                </div>
                <span class="date-time">${room.isJoined ? 'Đã tham gia' : 'Chưa tham gia'}</span>
            </a>
        </li>`;
        });
    }
}

function openRoom(room) {
    nameRoom.textContent = room.NameRoom;
    document.querySelector('#title-room').textContent = room.Title;
}

function showMess(messages) {
    chatter.innerHTML = "";
    if (messages) {
        messages.forEach(mess => {
            if (mess.Sender === "Admin") {
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
            else if (mess.Sender !== username) {
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
            else {
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
    chatter.scrollTop = chatter.scrollHeight;
}

function openJoinRoomPopup(element) {
    document.getElementById('joinRoomPopup').style.display = 'block';
}

//#endregion

