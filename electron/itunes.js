class ITunes
{
    constructor()
    {
        this.pending = [];
    }

    #artistSearchURL(term) { return `https://itunes.apple.com/search?term=${term}&media=music&entity=musicArtist&limit=1`; }

    async getArtistURL(term)
    {
        const URL = this.#artistSearchURL(term);

        const api = await (await fetch(URL)).json();

        if (api.resultCount === 0) return null;

        return api.results[0].artistLinkUrl;
    }

    async getArtistPicture(artistURL)
    {
        const scrape = await fetch(artistURL);

        const decoder = new TextDecoder('utf-8');

        let html = '', pictureURL;

        for await (const chunk of scrape.body)
        {
            html += decoder.decode(chunk, { stream: true });

            const arrived = html.split('<meta property="og:image" content="');

            if (arrived.length > 1)
            {
                const split = arrived[1].split('"');
                
                if (split.length > 1)
                {
                    pictureURL = split[0];
                    break;
                }
            }
        }

        const parts = pictureURL.split('/');
        parts.pop();
        parts.push('500x500.webp');
        pictureURL = parts.join('/');

        return pictureURL;
    }

    async bufferFromURL(pictureURL) { return await (await fetch(pictureURL)).arrayBuffer(); }
}

const scrapper = new ITunes();

module.exports = scrapper;