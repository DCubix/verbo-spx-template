/**
 * Holyrics JSON return type
 * @typedef {Object} HolyricsDataMap
 * @property {string} type - The type of the data.
 * @property {string} text - The lyrics or scripture text to be displayed.
 * @property {string} [header] - An optional header to be displayed above the text.
 */

/**
 * Holyrics configuration object
 * @typedef {Object} HolyricsConfig
 * @property {string} [host] - The hostname of the server. Defaults to the current window location hostname.
 * @property {string} [port] - The port number of the server. Defaults to the current window location port.
 */

/**
 * Holyrics BIBLE data structure
 * @typedef {Object} HolyricsBibleData
 * @property {string} reference - The scripture reference to be displayed.
 * @property {string} text - The scripture text to be displayed.
 */

/**
 * Holyrics MUSIC data structure
 * @typedef {Object} HolyricsMusicData
 * @property {string} text - The lyrics of the song to be displayed.
 */

/**
 * Get the endpoint URL for fetching the lyrics/scripture data. 
 * @param {HolyricsConfig} config - Configuration object containing host and port.
 * @returns {string} The endpoint URL to fetch the lyrics/scripture data.
 */
function holyricsGetEndpoint(config) {
    let { host, port } = config || {};

    if (!host) {
        host = window.location.hostname;
    }
    if (!port) {
        port = window.location.port;
    }
    return `http://${host}:${port}/view/text.json?_=${Date.now()}`;
}

/**
 * Fetch the lyrics/scripture data from the server using the endpoint URL.
 * @param {HolyricsConfig} config - Configuration object containing host and port.
 * @returns {Promise<HolyricsDataMap | undefined>} A promise that resolves with the fetched data or rejects with an error.
 * @throws Will throw an error if the fetch operation fails or if the response is not OK.
 */
async function holyricsFetchData(config) {
    const url = holyricsGetEndpoint(config);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return undefined;
        }
        const data = await response.json();
        return data.map;
    } catch (error) {
        console.error('Error fetching data: ', error);
        return undefined;
    }
}

/**
 * Fetch and parse the Bible data from the server. It extracts the scripture reference, verse text, and version (if available) from the raw text.
 * @param {HolyricsConfig} config - Configuration object containing host and port.
 * @returns {Promise<HolyricsBibleData | undefined>} A promise that resolves with the parsed Bible data, null if no text is found, or undefined if the data type is not BIBLE.
 */
async function holyricsFetchBible(config) {
    try {
        const data = await holyricsFetchData(config);
        if (!data || data.type !== 'BIBLE') {
            return undefined;
        }

        const rawText = data.text || '';
        if (!rawText) return undefined;

        // Extract reference from <desc>...</desc>
        let reference = '';
        const descMatch = rawText.match(/<desc>(.*?)<\/desc>/);
        if (descMatch) {
            reference = descMatch[1].trim();
        } else {
            const tmp = document.createElement('div');
            tmp.innerHTML = data.header;
            reference = (tmp.textContent || tmp.innerText || '').trim();
        }

        // Extract verse text: content inside <ctt> but before <desc>
        let verseText = '';
        const cttMatch = rawText.match(/<ctt>(.*?)(?:<desc>|<\/ctt>)/s);
        if (cttMatch) {
            // Strip any remaining HTML tags and decode entities
            const tmp = document.createElement('div');
            tmp.innerHTML = cttMatch[1];
            verseText = (tmp.textContent || tmp.innerText || '').trim();
        }

        if (!verseText) return undefined;

        // Extract bible version from after </ctt> (e.g. "(NVT)")
        let version = '';
        const afterCtt = rawText.split('</ctt>')[1] || '';
        const verMatch = afterCtt.match(/\(([^)]+)\)/);
        if (verMatch) {
            version = verMatch[1].trim();
        }

        // Append version to reference if available
        if (version && reference) {
            reference += ' (' + version + ')';
        }

        return { reference: reference, text: verseText };
    } catch (error) {
        console.error('Error fetching Bible data:', error);
        return undefined;
    }
}

/**
 * Fetch and parse the Music data from the server. It extracts the lyrics text while stripping out any hidden spans and HTML tags.
 * @param {HolyricsConfig} config - Configuration object containing host and port.
 * @returns {Promise<HolyricsMusicData | undefined>} A promise that resolves with the parsed Music data, null if no text is found, or undefined if the data type is not MUSIC.
 */
async function holyricsFetchMusic(config) {
    try {
        const data = await holyricsFetchData(config);
        if (!data || data.type !== 'MUSIC') {
            return undefined;
        }
        
        const rawText = data.text || '';
        if (!rawText) return undefined;

        // Strip hidden spans and any remaining HTML tags
        const tmp = document.createElement('div');
        tmp.innerHTML = rawText;
        const cleanText = (tmp.textContent || tmp.innerText || '').trim();

        if (!cleanText) return undefined;

        return { text: cleanText };
    } catch (error) {
        console.error('Error fetching Music data:', error);
        return undefined;
    }
}
