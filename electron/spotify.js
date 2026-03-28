/**
 * https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security
 * 
 * ONLY PREMIUM USERS CAN ACCESS SPOTIFY API.
 * FILE NO LONGER IN USE. BUT AVAILABLE FOR REFERENCE.
 */

const { appdata } = require('./util');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const { clientID, clientSecret } = appdata.get('config').spotify;

const authToken = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

let lastExpireTime = Date.now();

let token;

async function refreshToken()
{
    if (Date.now() >= lastExpireTime)
    {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: new URLSearchParams({grant_type: 'client_credentials'}),
            headers: {'Authorization': `Basic ${authToken}`, 'Content-Type': 'application/x-www-form-urlencoded'}
        });
        
        const { access_token, expires_in } = await response.json();

        lastExpireTime = Date.now() + ((expires_in - 100) * 1000);

        token = access_token;
    }
}

let inCooldown = false;
let fetchCount = 0;

async function cooldownFetch(url)
{
    while (inCooldown) await sleep(5);

    fetchCount++;

    if (fetchCount >= 15)
    {
        fetchCount = 0;

        inCooldown = true;

        setTimeout(() => {inCooldown = false}, 30 * 1000);
    }

    await refreshToken();

    return await fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}});
}

async function getArtistPicture(artist)
{
    const url = `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`;

    await refreshToken();
    
    const response = await cooldownFetch(url);
    
    const { artists } = await response.json();

    const imageURL = artists.items?.[0]?.images?.[0]?.url;

    let data = null;
    
    if (imageURL !== undefined)
    {
        const imageResponse = await fetch(imageURL);

        data = await imageResponse.arrayBuffer();
    }

    return { url: imageURL, data };
}

async function getAlbumArtURL(album, artist)
{
    const url = `https://api.spotify.com/v1/search?q=${album} artist:${artist}&type=album&limit=1`;

    await refreshToken();
    
    const response = await cooldownFetch(url);
    
    const { albums } = await response.json();

    const imageURL = albums.items?.[0]?.images?.[0]?.url;

    return imageURL
}

module.exports = { getArtistPicture, getAlbumArtURL };