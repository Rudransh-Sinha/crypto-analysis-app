import Parser from 'rss-parser';

export async function GET() {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL('https://cointelegraph.com/rss');

        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const news = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate ? new Date(item.isoDate) : new Date(item.pubDate),
            content: item.contentSnippet || item.content,
            creator: item.creator,
            categories: item.categories || [],
            source: 'Cointelegraph',
            imageUrl: item.enclosure?.url || null // Cointelegraph provides high-quality images in enclosure
        }));

        const last2Hours = news.filter(item => item.isoDate > twoHoursAgo);
        const last24Hours = news.filter(item => item.isoDate > twentyFourHoursAgo && item.isoDate <= twoHoursAgo);

        return Response.json({
            latest: last2Hours,
            daily: last24Hours
        });
    } catch (error) {
        console.error('RSS Fetch Error:', error);
        return Response.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
