// Import necessary modules
const app = require('./app'); // Import the main app to access `getBotUptime`

// Bot information
const Info = {
    description: "KORA AI Bot Status",
    bot_name: "KORA AI",
    owner: "Kolawole Suleiman",
    version: "v1.0",
    purpose: "Provides assistance, information, and companionship.",
    last_update: "September 14, 2024"
};

/**
 * Format duration from seconds into a human-readable string.
 * @param {number} seconds - Total seconds to format.
 * @returns {string} - Formatted duration as "Xd Xh Xm Xs".
 */
function formatDuration(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Generate and return the bot's status report.
 * @returns {string} - Bot status report.
 */
function execute() {
    try {
        // Get the bot's uptime in seconds
        const uptimeSeconds = app.getBotUptime();

        // Format uptime for better readability
        const uptimeStr = formatDuration(uptimeSeconds);

        // Visual and structured response
        const response = `
╭───────────────────────────╮
│       🤖 KORA AI Status       │
╰───────────────────────────╯

🔷 Bot Name: ${Info.bot_name}
👤 Owner: ${Info.owner}
📌 Version: ${Info.version}
🎯 Purpose: ${Info.purpose}
📅 Last Update: ${Info.last_update}

⏳ Uptime:
   🕒 ${uptimeStr}

╭───────────────────────────╮
│ 🙏 Thank you for using KORA AI! │
╰───────────────────────────╯
        `;

        return response;
    } catch (error) {
        console.error("Error generating bot status:", error);
        return "🚨 Unable to retrieve bot status. Please try again later.";
    }
}

// Export the execute function for external usage
module.exports = { execute };
