import mssql from "mssql";

// Cấu hình kết nối đến SQL Server
const config = {
    user: 'sa',
    password: '123456',
    server: '127.0.0.1',
    database: 'ChatApp',
    options: {
        encrypt: true, // Nếu sử dụng kết nối an toàn
        trustServerCertificate: true,
    },
};

async function loginMethod(username, password) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng TaiKhoan để kiểm tra đăng nhập
        const result = await mssql.query `SELECT * FROM TaiKhoan WHERE Username = ${username} AND Password = ${password}`;

        // Trả về User
        return result.recordset[0];
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function checkAccount(username) {
    try {
        await mssql.connect(config);

        const result = await mssql.query `SELECT * FROM TaiKhoan WHERE Username = ${username}`;

        return result.recordset[0];
    } catch (error) {
        console.error('Error:', err);
    } finally {
        await mssql.close();
    }
}

async function registerMethod(username, password, email) {

    try {
        if (username && password && email) {
            console.log("Had data");
        } else {
            console.log("No data");
        }
        await mssql.connect(config);

        const result = await mssql.query `INSERT INTO TaiKhoan (Username, Password, Email) OUTPUT inserted.* VALUES (${username}, ${password}, ${email})`;

        return result.recordset[0];
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mssql.close();
    }
}

async function checkJoinRoom(nameRoom, username) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `SELECT * FROM ThamGia WHERE NameRoom = ${nameRoom} AND Username = ${username}`;

        return result.recordset[0];
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function createRoom(nameRoom, password, title) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `INSERT INTO PhongChat (NameRoom, Password, Title) OUTPUT INSERTED.* VALUES (${nameRoom}, ${password}, ${title})`;
        return result.recordset[0];
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function joinRoom(nameRoom, username) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `INSERT INTO ThamGia (NameRoom, Username) VALUES (${nameRoom}, ${username})`;

        return result.recordset;
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function getAllRooms() {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `SELECT DISTINCT NameRoom, Title FROM PhongChat`;

        return result.recordset;
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function getRoomByName(nameRoom) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `SELECT * FROM PhongChat WHERE NameRoom = ${nameRoom}`;
        return result.recordset[0];
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomId += characters.charAt(randomIndex);
    }

    return randomId;
}

async function insertMess(nameRoom, sender, content, time, type) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        const messageId = generateRandomId(20);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `INSERT INTO TinNhan ( Id, NameRoom, Sender, ContentChat, Time, Type) VALUES (${messageId}, ${nameRoom}, ${sender}, ${content}, ${time}, ${type})`;

        return result.recordset;
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function deleteMessage(messageId) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn xóa tin nhắn dựa trên ID
        const result = await mssql.query `UPDATE TinNhan SET Type = 'deleted' WHERE Id = ${messageId}`;
        return result.rowsAffected; // Trả về số lượng bản ghi bị ảnh hưởng (đã xóa)
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

async function findMessageById(messageId) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn tìm tin nhắn dựa trên ID
        const result = await mssql.query `SELECT * FROM TinNhan WHERE Id = ${messageId}`;

        // Trả về kết quả (có thể là một bản ghi hoặc null nếu không tìm thấy)
        return result.recordset[0];
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}


async function getAllMessOfRoom(nameRoom) {
    try {
        // Tạo đối tượng kết nối
        await mssql.connect(config);

        // Thực hiện truy vấn đến bảng
        const result = await mssql.query `SELECT * FROM TinNhan WHERE NameRoom = ${nameRoom} ORDER BY CONVERT(datetime, REPLACE(Time, ',', ''), 101) ASC`;

        return result.recordset;
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        await mssql.close();
    }
}

// Export the loginMethod function for use in another script
export {
    loginMethod,
    checkJoinRoom,
    createRoom,
    joinRoom,
    getAllRooms,
    getRoomByName,
    insertMess,
    deleteMessage,
    findMessageById,
    getAllMessOfRoom,
    checkAccount,
    registerMethod,
}