import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import React from 'react';

// Wrapper for hooks that need QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('Inventory Dashboard API Tests', () => {
    beforeAll(() => {
        // Clear query cache before tests
        queryClient.clear();
    });

    it('should fetch products successfully', async () => {
        // Mock fetch for this test
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ id: 1, name: 'Product 1' }]),
            })
        ) as jest.Mock;

        const { result } = renderHook(
            () => useQuery({ queryKey: ['/api/products'], queryFn: () => fetch('/api/products').then(res => res.json()) }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toBeDefined();
    });

    it('should fetch inventory data for Feb 2025', async () => {
        const startDate = '2025-02-01';
        const endDate = '2025-02-28';

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ inventory: [] }),
            })
        ) as jest.Mock;

        const { result } = renderHook(
            () => useQuery({
                queryKey: ['/api/inventory', startDate],
                queryFn: async () => {
                    const response = await fetch(
                        `/api/inventory/available?startDate=${startDate}&endDate=${endDate}`
                    );
                    return response.json();
                }
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toBeDefined();
    });

    it('should fetch rentals successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ id: 1, status: 'rented' }]),
            })
        ) as jest.Mock;

        const { result } = renderHook(
            () => useQuery({ queryKey: ['/api/rentals'], queryFn: () => fetch('/api/rentals').then(res => res.json()) }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toBeDefined();
    });
});
