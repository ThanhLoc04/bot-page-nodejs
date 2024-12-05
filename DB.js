const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('winston');

// Đường dẫn tệp cơ sở dữ liệu
const DB_FILE = path.resolve(__dirname, 'bot_database.db');

// Khởi tạo cơ sở dữ liệu
function initializeDatabase() {
    try {
        const db = new sqlite3.Database(DB_FILE);

        // Tạo bảng nếu chưa tồn tại
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS conversation (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    role TEXT CHECK(role IN ('user', 'model')) NOT NULL,
                    message TEXT NOT NULL,
                    timestamp INTEGER NOT NULL
                )
            `, (err) => {
                if (err) {
                    logger.error("Error initializing database:", err.message);
                } else {
                    logger.info("Database initialized successfully.");
                }
            });
        });

        db.close();
    } catch (err) {
        logger.error("Error initializing database:", err.message);
    }
}

// Lưu tin nhắn vào cơ sở dữ liệu
function saveMessage(userId, role, message) {
    try {
        const db = new sqlite3.Database(DB_FILE);

        const timestamp = Math.floor(Date.now() / 1000);
        const query = `
            INSERT INTO conversation (user_id, role, message, timestamp)
            VALUES (?, ?, ?, ?)
        `;

        db.run(query, [userId, role, message, timestamp], (err) => {
            if (err) {
                logger.error(`Error saving message for user ${userId}:`, err.message);
            } else {
                logger.info(`Message saved successfully for user ${userId}.`);
            }
        });

        db.close();
    } catch (err) {
        logger.error(`Error saving message for user ${userId}:`, err.message);
    }
}

// Lấy lịch sử trò chuyện của người dùng
function getUserHistory(userId, timeLimit = 86400) {
    return new Promise((resolve, reject) => {
        try {
            const db = new sqlite3.Database(DB_FILE);

            const currentTime = Math.floor(Date.now() / 1000);
            const timeThreshold = currentTime - timeLimit;
            const query = `
                SELECT role, message FROM conversation
                WHERE user_id = ? AND timestamp >= ?
                ORDER BY timestamp ASC
            `;

            db.all(query, [userId, timeThreshold], (err, rows) => {
                if (err) {
                    logger.error(`Error retrieving user history for ${userId}:`, err.message);
                    reject([]);
                } else {
                    const messages = rows.map(row => ({
                        role: row.role,
                        content: row.message,
                    }));
                    logger.info(`Retrieved user history for ${userId}.`);
                    resolve(messages);
                }
            });

            db.close();
        } catch (err) {
            logger.error(`Error retrieving user history for ${userId}:`, err.message);
            reject([]);
        }
    });
}

// Xóa các tin nhắn cũ
function clearOldMessages(timeLimit = 86400) {
    try {
        const db = new sqlite3.Database(DB_FILE);

        const currentTime = Math.floor(Date.now() / 1000);
        const timeThreshold = currentTime - timeLimit;
        const query = `
            DELETE FROM conversation WHERE timestamp < ?
        `;

        db.run(query, [timeThreshold], (err) => {
            if (err) {
                logger.error("Error clearing old messages:", err.message);
            } else {
                logger.info("Old messages cleared successfully.");
            }
        });

        db.close();
    } catch (err) {
        logger.error("Error clearing old messages:", err.message);
    }
}

// Khởi tạo cơ sở dữ liệu ngay khi tệp được nạp
initializeDatabase();

// Export các hàm để sử dụng bên ngoài
module.exports = {
    saveMessage,
    getUserHistory,
    clearOldMessages,
};
