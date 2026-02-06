import request from 'supertest';
import express, { Express } from 'express';
import { registerRoutes } from '../routes';
import { db } from '../../db'; // We will mock this

// Mock the database and metadata fetcher
jest.mock('../../db', () => ({
    db: {
        query: {
            contentItems: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
            contentCategories: {
                findMany: jest.fn(),
            },
        },
        insert: jest.fn(() => ({
            values: jest.fn(() => ({
                returning: jest.fn(),
            })),
        })),
    },
}));

// Mock metadata fetcher to avoid external calls
jest.mock('../services/metadata-fetcher', () => ({
    fetchUrlMetadata: jest.fn().mockResolvedValue({
        title: 'Mock Title',
        description: 'Mock Description',
        image: 'http://mock.com/image.jpg',
        type: 'article',
    }),
    extractDomain: jest.fn().mockReturnValue('mock.com'),
}));

describe('Content Hub API', () => {
    let app: Express;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        // Mock server object for websocket setup (not needed for these tests but required by signature)
        const server = require('http').createServer(app);
        registerRoutes(app, server);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/admin/content/fetch-metadata', () => {
        it('should return metadata for a valid URL', async () => {
            // Mock no existing content
            (db.query.contentItems.findFirst as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post('/api/admin/content/fetch-metadata')
                .send({ url: 'http://example.com/test' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                title: 'Mock Title',
                source: 'mock.com',
                thumbnailUrl: 'http://mock.com/image.jpg'
            }));
        });

        it('should return 409 if URL already exists', async () => {
            // Mock existing content
            (db.query.contentItems.findFirst as jest.Mock).mockResolvedValue({ id: 1, url: 'http://example.com/test' });

            const response = await request(app)
                .post('/api/admin/content/fetch-metadata')
                .send({ url: 'http://example.com/test' });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/admin/content', () => {
        it('should create new content successfully', async () => {
            const mockContent = {
                title: 'New Resource',
                url: 'http://example.com/new',
                categoryId: 1
            };

            // Mock DB insert returning the new item
            const insertMock = jest.fn().mockReturnValue([{ id: 1, ...mockContent }]);
            const valuesMock = jest.fn(() => ({ returning: insertMock }));
            (db.insert as jest.Mock).mockImplementation(() => ({ values: valuesMock }));

            const response = await request(app)
                .post('/api/admin/content')
                .send(mockContent);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 1);
        });
    });
});
