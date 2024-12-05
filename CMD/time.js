const { Calendar } = require('calendar');  // Import the calendar package
const calendar = new Calendar();

// Function to get formatted date and time
function execute() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;  // getMonth() is zero-based
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Get calendar for the current month
    const cal = calendar.month(year, month - 1);  // calendar month is 0-indexed
    
    // Format the period string like 'Thu Dec 05 2024'
    const period = now.toDateString();
    
    // Format the response
    let response = "________________________\n";
    response += "|                       |\n";
    response += "| Today's Date 🌍       |\n";
    response += "|_______________________|\n";
    response += `⏰ Time      | ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}\n`;
    response += `🗺️ Date      | ${month}/${day}/${year}\n`;
    response += "|                       |\n";
    response += "|_______ Calendar 📜 ___|\n";
    response += `${cal.join("\n")}\n`;  // Join the calendar rows with newline
    response += "|_______________________|\n";
    response += `| ${period.slice(0, 11)}\n`;
    response += "________________________";
    
    return response;
}

console.log(execute());
