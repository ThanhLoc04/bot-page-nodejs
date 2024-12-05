const axios = require('axios');
const cheerio = require('cheerio');

const Info = {
    Description: "Get News About English Premier League"
};

async function execute() {
    const url = "https://www.skysports.com/premier-league-news";
    
    try {
        // Send HTTP request to the URL
        const response = await axios.get(url);
        
        // Check if the page is accessible
        if (response.status !== 200) {
            return "⚠️ Unable to access the Sky Sports website at the moment. Please try again later.";
        }
        
        // Parse the page content using Cheerio (equivalent to BeautifulSoup)
        const $ = cheerio.load(response.data);
        
        // Find all news articles (selector based on current structure)
        const newsArticles = $('.news-list__headline-link');
        
        // Check if there are any news articles
        if (newsArticles.length === 0) {
            return "⚠️ No latest news found.";
        }

        // Collect the titles and links to the news articles
        let newsList = [];
        newsArticles.slice(0, 5).each((index, element) => {  // Limit to the first 5 articles
            const title = $(element).text().trim();
            const link = "https://www.skysports.com" + $(element).attr('href');
            newsList.push(`🔹 ${title} - [Read More](${link})`);
        });

        // Format the output for news
        let responseText = "⚽ **Latest EPL News from Sky Sports** ⚽\n\n";
        responseText += newsList.join("\n");

        // Fetch live matches if available
        const liveMatchesUrl = "https://www.skysports.com/live-scores/football";
        const liveResponse = await axios.get(liveMatchesUrl);

        if (liveResponse.status === 200) {
            const live$ = cheerio.load(liveResponse.data);
            const liveMatches = live$('.fixres__item');

            if (liveMatches.length > 0) {
                responseText += "\n\n🔥 **Live Matches** 🔥\n";
                liveMatches.slice(0, 3).each((index, element) => {  // Limit to 3 live matches
                    const teams = live$(element).find('.matches__item-col--team-name').text().trim();
                    const score = live$(element).find('.matches__item-col--scores').text().trim();
                    responseText += `⚡ ${teams} - ${score}\n`;
                });
            } else {
                responseText += "\n\n🔥 No live matches currently.";
            }
        }

        return responseText;
    } catch (error) {
        console.error("Error fetching data:", error);
        return "⚠️ An error occurred while fetching data. Please try again later.";
    }
}

execute().then(response => {
    console.log(response);  // Print the result
});
