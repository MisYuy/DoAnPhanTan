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
    console.log(result.recordset[0]);
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
    insertMess,
    getAllMessOfRoom,
}
  