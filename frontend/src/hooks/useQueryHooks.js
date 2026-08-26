/**
 * Shared React Query hooks
 *
 * All data fetching for key entities is centralised here.
 * - Guarantees fresh data on refresh (no stale keepPreviousData flash)
 * - Pages share the cached response during in-app navigation
 * - Socket.io events invalidate the query cache in real-time
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buildApiUrl } from '../services/api'

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  plots:      ['plots'],
  bookings:   ['bookings'],
  users:      ['users'],
  siteConfig: ['site-config'],
  zones:      ['zones'],
  maps:       ['maps'],
}

// ─── Fetcher (always bypasses browser cache) ─────────────────────────────────
const fetcher = async (url) => {
  const res = await fetch(buildApiUrl(url), {
    cache: 'no-store',
    headers: {
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ─── Plots / Spots ───────────────────────────────────────────────────────────
export function usePlots(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.plots,
    queryFn:  () => fetcher('/api/map/plots'),
    staleTime: 60 * 1000,
    gcTime:    5 * 60 * 1000,
    select: (d) => (d?.success && Array.isArray(d.data)) ? d.data : [],
    ...options,
  })
}

// ─── Bookings ────────────────────────────────────────────────────────────────
export function useBookings(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings,
    queryFn:  () => fetcher('/api/bookings'),
    staleTime: 30 * 1000,
    gcTime:    5 * 60 * 1000,
    select: (d) => (d?.success && Array.isArray(d.data)) ? d.data : [],
    ...options,
  })
}

// ─── Users ───────────────────────────────────────────────────────────────────
export function useUsers(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn:  () => fetcher('/api/auth/users'),
    staleTime: 60 * 1000,
    gcTime:    5 * 60 * 1000,
    select: (d) => (d?.success && Array.isArray(d.data)) ? d.data : [],
    ...options,
  })
}

// ─── Site Config (full) ───────────────────────────────────────────────────────
export function useSiteConfig(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.siteConfig,
    queryFn:  () => fetcher('/api/site-config'),
    staleTime: 60 * 1000,
    gcTime:    5 * 60 * 1000,
    select: (d) => (d?.success) ? d.data : null,
    ...options,
  })
}

// ─── Interactive Maps ────────────────────────────────────────────────────────
export function useMaps(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.maps,
    queryFn:  () => fetcher('/api/map/maps'),
    staleTime: 60 * 1000,
    gcTime:    5 * 60 * 1000,
    select: (d) => (d?.success && Array.isArray(d.data)) ? d.data : [],
    ...options,
  })
}

// ─── Convenience: invalidate helpers (call after socket events) ───────────────
export function useInvalidators() {
  const qc = useQueryClient()
  return {
    invalidatePlots:      () => qc.invalidateQueries({ queryKey: QUERY_KEYS.plots }),
    invalidateBookings:   () => qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings }),
    invalidateUsers:      () => qc.invalidateQueries({ queryKey: QUERY_KEYS.users }),
    invalidateSiteConfig: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.siteConfig }),
    invalidateMaps:       () => qc.invalidateQueries({ queryKey: QUERY_KEYS.maps }),
    invalidateAll: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.plots })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.siteConfig })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.maps })
    },
  }
}
