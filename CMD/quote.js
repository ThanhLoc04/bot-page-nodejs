const axios = require('axios');
const cheerio = require('cheerio');
const random = require('random');

const Info = {
    Description: "Get Random quotes to Motivate you"
};

async function execute() {
    const url = "http://quotes.toscrape.com/";

    try {
        // Send HTTP request to the URL
        const response = await axios.get(url);
        
        // Check if the page is accessible
        if (response.status !== 200) {
            return "⚠️ Unable to access the quotes website at the moment. Please try again later.";
        }

        // Parse the HTML content using Cheerio (similar to BeautifulSoup)
        const $ = cheerio.load(response.data);
        
        // Find all quotes
        const quotes = $(".quote");

        if (quotes.length === 0) {
            return "⚠️ No quotes found on the page.";
        }

        // Randomly select a quote
        const randomIndex = random.int(0, quotes.length - 1);
        const selectedQuote = quotes.eq(randomIndex);
        const quoteText = selectedQuote.find(".text").text().trim();
        const author = selectedQuote.find(".author").text().trim();
        const tags = selectedQuote.find(".tags .tag").map((i, el) => $(el).text()).get();

        // Format the quote in a visually appealing way
        let responseText = (
            `🌟 **Inspiring Quote of the Moment** 🌟\n\n`
            + `"${quoteText}"\n\n`
            + `— **${author}**\n\n`
            + `🔖 **Tags**: ${tags.length ? tags.join(', ') : 'No tags available'}\n\n`
            + `💬 _Remember, a quote a day keeps negativity away!_ 💫`
        );

        return responseText;
    } catch (error) {
        console.error("Error fetching data:", error);
        return "⚠️ An error occurred while fetching data. Please try again later.";
    }
}

execute().then(response => {
    console.log(response);  // Print the result
});
