require('dotenv').config();
const axios = require('axios');

const SMAN_API_KEY = process.env.SMAN_API_KEY; // Store the API key in a .env file
const SMAN_NEWS_URL = 'https://newsapi.org/v2/top-headlines';

const Info = {
    Description: "Get the latest news headlines from around the world."
};

async function execute() {
    const country = 'us'; // Default country is US

    try {
        // Fetch the news data from the API
        const response = await axios.get(`${SMAN_NEWS_URL}?country=${country}&apiKey=${SMAN_API_KEY}`);
        const data = response.data;

        // Check if the API response is OK
        if (data.status !== 'ok') {
            return `⚠️ Error: ${data.message || 'An unknown error occurred.'}`;
        }

        // Extract the top 5 headlines
        const articles = data.articles;
        if (!articles || articles.length === 0) {
            return "⚠️ No articles found for the specified country.";
        }

        // Format the top 5 headlines
        let output = [];
        output.push("✨ Top 5 Headlines ✨");
        output.push("╭───────────────────────────────╮");
        
        articles.slice(0, 5).forEach((article, index) => {
            output.push(`│ ${index + 1}. ${article.title}`);
        });

        output.push("╰───────────────────────────────╯");

        return output.join("\n");
    } catch (error) {
        return `⚠️ Error fetching news data: ${error.message}`;
    }
}

// Call the execute function and log the result
execute().then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
