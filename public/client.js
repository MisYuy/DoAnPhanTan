const socket = io('http://127.0.0.1:3500');

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
const chatfooter = document.querySelector('.chat-footer');

document.querySelector('.login-wrap').style.display = "flex";
document.querySelector('main').style.display = "none";
document.getElementById('customStyle').href = "authenticate.css";

let username = "";
let curNameRoomJoined = "";
let curNameRoomSelecting = "";
let curElementRoomSelecting;

let curIdMessReply = "";


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
    } else {
        const message = document.getElementById('registerResult');
        let mess = '';
        if (!username || !password || !repass || !email) {
            mess = "NHẬP ĐẦY ĐỦ THÔNG TIN!";
        } else if (password !== repass) {
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

    const existingReplyBlock = document.getElementById('replyBlock');

    if (existingReplyBlock) {
        const type = curIdMessReply;
        console.log("Send message " + msgInput.value + " from " + username + type);
        e.preventDefault();
        if (msgInput.value) {
            socket.emit('reply', {
                sender: username,
                text: msgInput.value,
                nameRoom: curNameRoomJoined,
                type: type
            });
            msgInput.value = '';
        }
        msgInput.focus();
        existingReplyBlock.remove();
    } else {
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
    } else {
        document.querySelector('#loginResult').innerHTML = `<p style="text-align: center; color: red;">Tài khoản hoặc mật khẩu không chính xác!!!</p>`;
    }
});

socket.on("registerCheckAccountResult", ({ result }) => {
    console.log(result);
    if (result === true) {
        const message = document.getElementById('registerResult');
        message.textContent = 'USER ĐÃ TỒN TẠI!';
        message.style.color = 'red';
    }
});

socket.on("registerResult", ({ result }) => {
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
    } else {
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

    const existingReplyBlock = document.getElementById('replyBlock');

    // Nếu đã có, xóa replyBlock cũ
    if (existingReplyBlock) {
        existingReplyBlock.remove();
    }

}

function findMessageById(messages, messageId) {
    return messages.find(message => message.Id === messageId);
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
            } else if (mess.Sender !== username) {
                if (mess.Type == "deleted") {
                    chatter.innerHTML += `<div class="chat-wrapper left" style="margin-top: 15px; margin-bottom: 15px;">
                    <div class="chatter-title">
                        ${mess.Sender}
                    </div>
                    <div class= "message-content">
                        <div class="chatter-message" style="background-color: #f2f2f2; opacity: 0.5;" id = "${mess.Id}">
                            <p style="color: black;">Tin nhắn đã bị thu hồi</p>
                        </div>
                    </div>
                    <div class="time-plate" style="margin-bottom: 20px;">
                        ${mess.Time}
                    </div>
                </div>`;
                } else if (mess.Type == "Normal") {
                    chatter.innerHTML += `<div class="chat-wrapper left" style="margin-top: 15px; margin-bottom: 15px;">
                    <div class="chatter-title">
                        ${mess.Sender}
                    </div>
                    <div class= "message-content">
                        <div class="chatter-message" id = "${mess.Id}">
                            <p>${mess.ContentChat}</p>
                        </div>
                        <div class="message-icons">
                            <button onclick="menu(event, '${mess.Id}')">
                                <div class="menu">
                                    <ul>
                                        <li onclick="menuAction('reply', '${mess.Id}', '${mess.NameRoom}', '${mess.Sender}', '${mess.ContentChat}')">Trả lời</li>                                
                                    </ul>
                                </div>
                                <p class="ellipsis"> &vellip;</p>
                            </button>
                        </div>
                    </div>
                    <div class="time-plate" style="margin-bottom: 20px;">
                        ${mess.Time}
                    </div>
                </div>`;
                } else {
                    messageId = mess.Type;
                    let messageReply = findMessageById(messages, messageId);
                    let replySender = messageReply.Sender;
                    let contentChat = messageReply.ContentChat;
                    if (messageReply.Sender == username) {
                        replySender = "bạn";
                    }
                    if (messageReply.Type == "deleted") {
                        contentChat = "Tin nhắn đã bị thu hồi";
                    }
                    chatter.innerHTML += `<div class="chat-wrapper left" style="margin-top: 15px; margin-bottom: 15px;">
                    <div class="chatter-title">
                        ${mess.Sender} đã trả lời ${replySender}
                    </div>
                    <div class="reply-message" onclick="replyToMessage('${messageReply.Id}')">
                            <p>${contentChat}</p>
                        </div>
                    <div class= "message-content">
                        <div class="chatter-message" id = "${mess.Id}">
                            <p>${mess.ContentChat}</p>
                        </div>
                        <div class="message-icons">
                            <button onclick="menu(event, '${mess.Id}')">
                                <div class="menu">
                                    <ul>
                                        <li onclick="menuAction('reply', '${mess.Id}', '${mess.NameRoom}', '${mess.Sender}', '${mess.ContentChat}')">Trả lời</li>                                
                                    </ul>
                                </div>
                                <p class="ellipsis"> &vellip;</p>
                            </button>
                        </div>
                    </div>
                    <div class="time-plate" style="margin-bottom: 20px;">
                        ${mess.Time}
                    </div>
                </div>`;
                }
            } // Bản thân
            else {
                if (mess.Type == "deleted") {
                    chatter.innerHTML += `<div class="chat-wrapper right" style="margin-top: 15px; margin-bottom: 15px;">
                    <div class="chatter-title">
                    </div>
                    <div class= "message-content">
                        <div class="chatter-message" style="background-color: #f2f2f2; opacity: 0.5;" id = "${mess.Id}">
                            <p style="color: black;">Tin nhắn đã bị thu hồi</p>
                        </div>
                    </div>
                    <div class="time-plate" style="margin-bottom: 20px;">
                        ${mess.Time}
                    </div>
                </div>`;
                } else if (mess.Type == "Normal") {
                    chatter.innerHTML += `<div class="chat-wrapper right" style="margin-top: 15px; margin-bottom: 15px;">
                    <div class="chatter-title">
                        
                    </div>
                    <div class= "message-content">
                        <div class="message-icons">
                            <button onclick="menu(event, '${mess.Id}')">
                                <div class="menu">
                                    <ul>
                                        <li onclick="menuAction('undo', '${mess.Id}', '${mess.NameRoom}', '${mess.Sender}', '${mess.ContentChat}')">Thu hồi</li>
                                        <li onclick="menuAction('reply', '${mess.Id}', '${mess.NameRoom}', '${mess.Sender}', '${mess.ContentChat}')">Trả lời</li>                                
                                    </ul>
                                </div>
                                <p class="ellipsis"> &vellip;</p>
                            </button>
                        </div>
                        <div class="chatter-message" id = "${mess.Id}">
                            <p>${mess.ContentChat}</p>
                        </div>
                    </div>
                    <div class="time-plate" style="margin-bottom: 20px;">
                        ${mess.Time}
                    </div>
                </div>`;
                } else {
                    messageId = mess.Type;
                    let messageReply = findMessageById(messages, messageId);
                    let replySender = messageReply.Sender;
                    let contentChat = messageReply.ContentChat;
                    if (messageReply.Sender == username) {
                        replySender = "chính mình";
                    }
                    if (messageReply.Type == "deleted") {
                        contentChat = "Tin nhắn đã bị thu hồi";
                    }
                    chatter.innerHTML += `<div class="chat-wrapper right" style="margin-top: 15px; margin-bottom: 15px;">
                        <div class="chatter-title">
                            Bạn đã trả lời ${replySender}
                        </div>
                        <div class="reply-message" onclick="replyToMessage('${messageReply.Id}')">
                            <p>${contentChat}</p>
                        </div>
                        <div class= "message-content">
                            <div class="message-icons">
                                <button onclick="menu(event, '${mess.Id}')">
                                    <div class="menu">
                                        <ul>
                                            <li onclick="menuAction('undo', '${mess.Id}', '${mess.NameRoom}', '${mess.Sender}', '${mess.ContentChat}')">Thu hồi</li>
                                            <li onclick="menuAction('reply', '${mess.Id}', '${mess.NameRoom}', '${mess.Sender}', '${mess.ContentChat}')">Trả lời</li>                                
                                        </ul>
                                    </div>
                                    <p class="ellipsis"> &vellip;</p>
                                </button>
                            </div>
                            <div class="chatter-message" id = "${mess.Id}">
                                <p>${mess.ContentChat}</p>
                            </div>
                        </div>
                        <div class="time-plate" style="margin-bottom: 20px;">
                            ${mess.Time}
                        </div>
                    </div>`;;
                }
            }
        })
    }
    chatter.scrollTop = chatter.scrollHeight;
}

function menu(event) {
    // Ngăn chặn sự kiện lan truyền để không tác động đến các phần tử khác
    event.stopPropagation();

    // Lấy phần tử menu
    const menu = event.currentTarget.querySelector('.menu');

    // Hiển thị hoặc ẩn menu tùy thuộc vào trạng thái hiện tại
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';

    // Đặt sự kiện click một lần để ẩn menu khi click bất cứ nơi nào khác trên trang
    document.addEventListener('click', closeMenuOnce);
}

function closeMenuOnce() {
    // Ẩn tất cả các menu
    const menus = document.querySelectorAll('.menu');
    menus.forEach(menu => menu.style.display = 'none');

    // Hủy bỏ sự kiện click một lần
    document.removeEventListener('click', closeMenuOnce);
}


function menuAction(action, messageId, nameRoom, Sender, ContentChat) {
    // Thực hiện các hành động tương ứng với lựa chọn menu
    if (action === 'undo') {
        // Hiển thị cửa sổ xác nhận
        const confirmation = confirm("Bạn có chắc chắn muốn thu hồi tin nhắn này?");

        // Xử lý tùy thuộc vào lựa chọn của người dùng
        if (confirmation) {
            // Người dùng chọn "Có", thực hiện hành động thu hồi
            socket.emit('deleteMessage', { messageId, nameRoom });
            console.log(`Đã chọn "Có". Thực hiện hành động thu hồi tin nhắn với ID: ${messageId}, ${nameRoom}`);
            // Thêm mã xử lý thu hồi ở đây
        } else {
            // Người dùng chọn "Không", không thực hiện hành động
            console.log('Đã chọn "Không". Hủy thu hồi tin nhắn.');
            // Thêm mã xử lý khi hủy thu hồi ở đây
        }
    } else if (action === 'reply') {
        // Thực hiện hành động trả lời

        const existingReplyBlock = document.getElementById('replyBlock');

        // Nếu đã có, xóa replyBlock cũ
        if (existingReplyBlock) {
            existingReplyBlock.remove();
        }

        curIdMessReply = messageId;
        if (Sender == username) {
            Sender = "chính mình";
        }
        const replyBlock = document.createElement('div');
        replyBlock.id = 'replyBlock';
        replyBlock.innerHTML = `
            <strong>Bạn đang trả lời ${Sender}</strong>
            <button id="deleteReplyBlock" style="background: none; border: none; cursor: pointer; font-size: 10px; margin-left: 100%;">X</button>
            <p id="replyContent">${ContentChat}</p>
        `;

        // Thêm sự kiện click để xóa replyBlock
        const deleteButton = replyBlock.querySelector('#deleteReplyBlock');
        deleteButton.addEventListener('click', function() {
            replyBlock.remove();
        });

        const firstChild = chatfooter.firstChild;
        chatfooter.insertBefore(replyBlock, firstChild);


        console.log('Đã chọn Trả lời. Thực hiện hành động trả lời tin nhắn.');
        // Thêm mã xử lý trả lời ở đây
    }

    // Ẩn menu sau khi chọn lựa
    closeMenuOnce();
}

function replyToMessage(id) {
    // Code để xử lý khi người dùng muốn trả lời tin nhắn
    // ...

    // Sau khi tin nhắn trả lời được tạo xong, cuộn đến tin nhắn gốc
    scrollToMessage(id);
}

function scrollToMessage(id) {
    // Lấy phần tử có id tương ứng
    let targetElement = document.getElementById(id);

    // Kiểm tra xem phần tử có tồn tại không
    if (targetElement) {
        // Cuộn đến vị trí của phần tử
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
        console.log("Không tìm thấy phần tử với id là " + id);
    }
}


function openJoinRoomPopup(element) {
    document.getElementById('joinRoomPopup').style.display = 'block';
}

//#endregion