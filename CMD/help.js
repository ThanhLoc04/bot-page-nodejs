const fs = require('fs');
const path = require('path');
const logger = require('../logger.js'); // Đảm bảo bạn có module logger hoặc thay thế bằng console.log

/**
 * Generate a structured response listing all available commands and their descriptions.
 * @returns {string} - Command list response.
 */
function execute() {
    let response = "📜 **KORA AI Command List** 📜\n\n";
    response += "Here are the available commands:\n\n";

    // Header for the command diagram
    response += "╔════════════════════════════╗\n";
    response += "║    📂 **Command Overview** 📂   ║\n";
    response += "╚════════════════════════════╝\n\n";

    const cmdFolder = path.resolve(__dirname, 'CMD');

    // Iterate over each file in the CMD folder
    fs.readdirSync(cmdFolder).forEach((filename) => {
        if (filename.endsWith('.js') && filename !== 'index.js') {
            const commandName = filename.replace('.js', ''); // Remove .js extension

            try {
                // Dynamically import the command module
                const cmdModule = require(`./CMD/${commandName}`);
                const description = cmdModule.Info?.Description || "No description available.";

                // Append each command in a structured format with emojis
                response += `📌 **/${commandName}**\n`;
                response += `   📖 *Description*: ${description}\n`;
                response += "   ─────────────────────────────\n";
            } catch (error) {
                logger.warn(`Failed to load command ${commandName}: ${error.message}`);
                response += `📌 **/${commandName}**\n`;
                response += "   📖 *Description*: Unable to load description.\n";
                response += "   ─────────────────────────────\n";
            }
        }
    });

    // Footer with extra info or design
    response += "\n🛠️ **Tip**: Use `/command_name` to activate a command.\n";
    response += "💡 **For Example**: Type `/up` to check bot's status.\n";
    response += "THANKS FOR USING 😁\n";
    response += "🛡️ KOLAWOLE SULEIMAN\n";

    return response;
}

// Export the execute function for use elsewhere
module.exports = { execute };
