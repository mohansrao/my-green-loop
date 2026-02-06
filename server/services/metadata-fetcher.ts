import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface MetadataResult {
    title?: string;
    description?: string;
    image?: string;
    type?: 'article' | 'video' | 'podcast';
    siteName?: string;
    author?: string;
}

/**
 * Fetches Open Graph and standard metadata from a given URL.
 */
export async function fetchUrlMetadata(url: string): Promise<MetadataResult> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000 // 5 second timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract Open Graph / Twitter Card metadata
        const metadata: MetadataResult = {
            title: $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text().trim(),
            description: $('meta[property="og:description"]').attr('content') ||
                $('meta[name="twitter:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                '',
            image: $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content'),
            type: detectContentType($('meta[property="og:type"]').attr('content') || '', url),
            siteName: $('meta[property="og:site_name"]').attr('content') ||
                extractDomain(url),
            author: $('meta[name="author"]').attr('content'),
        };

        return metadata;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        // Return empty results rather than throwing, code will handle defaults
        return {
            title: '',
            description: '',
            type: detectContentType('', url),
            siteName: extractDomain(url)
        };
    }
}

/**
 * Detects content type based on SEO tags or URL patterns.
 */
function detectContentType(ogType: string, url: string): 'article' | 'video' | 'podcast' {
    const lowercaseOg = ogType.toLowerCase();
    const lowercaseUrl = url.toLowerCase();

    if (lowercaseOg.includes('video') ||
        lowercaseUrl.includes('youtube.com') ||
        lowercaseUrl.includes('vimeo.com')) {
        return 'video';
    }

    if (lowercaseOg.includes('podcast') ||
        lowercaseOg.includes('audio') ||
        lowercaseUrl.includes('spotify.com') ||
        lowercaseUrl.includes('apple.com/podcast')) {
        return 'podcast';
    }

    return 'article';
}

/**
 * Extracts a clean domain name for display.
 */
export function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return '';
    }
}

/**
 * Estimates reading time based on a word count.
 */
export function estimateReadingTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    const wpm = 200;
    return Math.ceil(wordCount / wpm) || 5; // Default to 5 mins if zero
}
