
import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

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
    const { result } = renderHook(
      () => useQuery({ queryKey: ['/api/products'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    console.log('Products data:', result.current.data);
    expect(result.current.data).toBeDefined();
  });

  it('should fetch inventory data for Feb 2025', async () => {
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
    });

    console.log('Inventory data:', result.current.data);
    expect(result.current.data).toBeDefined();
  });

  it('should fetch rentals successfully', async () => {
    const { result } = renderHook(
      () => useQuery({ queryKey: ['/api/rentals'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    console.log('Rentals data:', result.current.data);
    expect(result.current.data).toBeDefined();
  });
});
