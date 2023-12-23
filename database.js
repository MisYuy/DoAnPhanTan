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
    const result = await mssql.query`SELECT * FROM TaiKhoan WHERE Username = ${username} AND Password = ${password}`;

    // Trả về User
    return result.recordset[0];
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function checkJoinRoom(nameRoom, username){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`SELECT * FROM ThamGia WHERE NameRoom = ${nameRoom} AND Username = ${username}`;

    return result.recordset[0];
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function createRoom(nameRoom, password, title){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`INSERT INTO PhongChat (NameRoom, Password, Title) VALUES (${nameRoom}, ${password}, ${title})`;

    return result.recordset[0];
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function joinRoom(nameRoom, username){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`INSERT INTO ThamGia (NameRoom, Username) VALUES (${nameRoom}, ${username})`;

    return result.recordset;
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function getAllRooms(){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`SELECT DISTINCT NameRoom, Title FROM PhongChat`;

    return result.recordset;
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function getRoomByName(nameRoom){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`SELECT * FROM PhongChat WHERE NameRoom = ${nameRoom}`;
    return result.recordset[0];
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function insertMess(nameRoom, sender, content, time, type){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`INSERT INTO TinNhan (NameRoom, Sender, ContentChat, Time, Type) VALUES (${nameRoom}, ${sender}, ${content}, ${time}, ${type})`;

    return result.recordset;
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Đóng kết nối sau khi hoàn tất
    await mssql.close();
  }
}

async function getAllMessOfRoom(nameRoom){
  try {
    // Tạo đối tượng kết nối
    await mssql.connect(config);

    // Thực hiện truy vấn đến bảng
    const result = await mssql.query`SELECT * FROM TinNhan WHERE NameRoom = ${nameRoom} ORDER BY CONVERT(datetime, REPLACE(Time, ',', ''), 101) ASC`;

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
    getAllMessOfRoom,
}
  