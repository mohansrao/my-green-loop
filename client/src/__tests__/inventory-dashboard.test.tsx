
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

const currentMonth = '2025-02';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Eco Plate', category: 'plates', stock: 100 }]
    });

    const { result } = renderHook(
      () => useQuery({ queryKey: ['/api/products'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.data).toBeDefined();
    expect(result.current.data[0].name).toBe('Eco Plate');
  });

  it('should fetch inventory data for Feb 2025', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ '2025-02-01': 50 })
    });

    const startDate = '2025-02-01';
    const endDate = '2025-02-28';

    const { result } = renderHook(
      () => useQuery({
        queryKey: ['/api/inventory', currentMonth],
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
    }, { timeout: 3000 });

    expect(result.current.data).toBeDefined();
    expect(result.current.data['2025-02-01']).toBe(50);
  });

  it('should fetch rentals successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 101, customerName: 'John Doe', status: 'pending' }]
    });

    const { result } = renderHook(
      () => useQuery({ queryKey: ['/api/rentals'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.data).toBeDefined();
    expect(result.current.data[0].customerName).toBe('John Doe');
  });
});
