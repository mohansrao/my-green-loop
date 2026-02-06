import { fetchUrlMetadata, extractDomain } from './metadata-fetcher';
import fetch from 'node-fetch';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

const { Response } = jest.requireActual('node-fetch');

describe('Metadata Fetcher Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should extract metadata from standard Open Graph tags', async () => {
        const mockHtml = `
            <html>
                <head>
                    <meta property="og:title" content="Test Article Title" />
                    <meta property="og:description" content="This is a test description." />
                    <meta property="og:image" content="https://example.com/image.jpg" />
                    <meta property="og:type" content="article" />
                </head>
            </html>
        `;

        mockedFetch.mockResolvedValue(new Response(mockHtml, { status: 200 }));

        const metadata = await fetchUrlMetadata('https://example.com/article');

        expect(metadata).toEqual({
            title: 'Test Article Title',
            description: 'This is a test description.',
            image: 'https://example.com/image.jpg',
            type: 'article',
            siteName: 'example.com',
            author: undefined
        });
    });

    it('should correctly identify and handle YouTube videos', async () => {
        const mockHtml = `
            <html><title>Awesome Video - YouTube</title></html>
        `;

        mockedFetch.mockResolvedValue(new Response(mockHtml, { status: 200 }));

        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const metadata = await fetchUrlMetadata(url);

        expect(metadata.title).toBe('Awesome Video'); // Should strip "- YouTube"
        expect(metadata.image).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
        expect(metadata.type).toBe('video');
    });

    it('should fall back to standard meta tags if OG is missing', async () => {
        const mockHtml = `
            <html>
                <head>
                    <title>Fallback Title</title>
                    <meta name="description" content="Fallback Description">
                </head>
            </html>
        `;

        mockedFetch.mockResolvedValue(new Response(mockHtml, { status: 200 }));

        const metadata = await fetchUrlMetadata('https://example.com/fallback');

        expect(metadata.title).toBe('Fallback Title');
        expect(metadata.description).toBe('Fallback Description');
    });

    it('should handle network errors gracefully', async () => {
        mockedFetch.mockRejectedValue(new Error('Network error'));

        const metadata = await fetchUrlMetadata('https://example.com/fail');

        expect(metadata).toEqual(expect.objectContaining({
            title: '',
            description: '',
            siteName: 'example.com'
        }));
    });
});

describe('extractDomain', () => {
    it('should clean domain names', () => {
        expect(extractDomain('https://www.google.com/search')).toBe('google.com');
        expect(extractDomain('http://sub.example.co.uk')).toBe('sub.example.co.uk');
    });
});
