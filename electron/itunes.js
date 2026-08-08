class ITunes
{
    constructor()
    {
        this.waiting = false;
    }

    #searchURL(term) { return `https://itunes.apple.com/search?term=${term}&media=music&entity=album&limit=1`; }

    async search(term)
    {
        while (this.waiting) await new Promise(resolve => setTimeout(resolve, 1000));

        this.waiting = true;

        const URL = this.#searchURL(term);

        const response = await fetch(URL);

        if (!response.ok)
        {
            this.waiting = true;

            setTimeout(() => this.waiting = false, (parseInt(response.headers.get('retry-after')) || 10) * 1000);

            return await this.search(term);
        }

        this.waiting = false;

        const api = await response.json();

        if (api.resultCount === 0) return null;

        return api.results[0];
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
        parts.push('512x512.webp');
        pictureURL = parts.join('/');

        return pictureURL;
    }

    async bufferFromURL(pictureURL) { return await (await fetch(pictureURL)).arrayBuffer(); }
}

const scrapper = new ITunes();

module.exports = scrapper;