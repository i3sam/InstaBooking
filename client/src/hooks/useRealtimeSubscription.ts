import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';
type RealtimePayload = {
  eventType: RealtimeEvent;
  new: Record<string, any>;
  old: Record<string, any>;
  table: string;
};

/**
 * Hook for subscribing to real-time database changes
 * @param table - The table name to subscribe to
 * @param filter - Optional filter for the subscription
 * @param queryKey - React Query key to invalidate on changes
 * @param enabled - Whether the subscription is enabled
 */
export function useRealtimeSubscription({
  table,
  filter,
  queryKey,
  enabled = true,
}: {
  table: string;
  filter?: string;
  queryKey?: string | string[];
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimePayload | null>(null);

  useEffect(() => {
    if (!enabled || !supabase) {
      return;
    }

    // Build subscription query
    let subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...(filter && { filter })
        }, 
        (payload: any) => {
          console.log(`Realtime event on ${table}:`, payload.eventType, payload.new || payload.old);
          
          const event: RealtimePayload = {
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new,
            old: payload.old,
            table: table
          };
          
          setLastEvent(event);

          // Invalidate relevant queries to refetch data
          if (queryKey) {
            queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
          }
        }
      );

    // Subscribe with connection status tracking
    subscription.subscribe((status: any) => {
      console.log(`Realtime subscription status for ${table}:`, status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      console.log(`Unsubscribing from ${table} realtime`);
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [table, filter, queryKey, enabled, queryClient]);

  return {
    isConnected,
    lastEvent,
  };
}

/**
 * Hook for real-time appointments with ownership filtering
 */
export function useRealtimeAppointments(ownerId?: string) {
  const queryClient = useQueryClient();
  
  return useRealtimeSubscription({
    table: 'appointments',
    filter: ownerId ? `owner_id=eq.${ownerId}` : undefined,
    queryKey: '/api/appointments',
    enabled: !!ownerId
  });
}

/**
 * Hook for real-time pages with ownership filtering  
 */
export function useRealtimePages(ownerId?: string) {
  const queryClient = useQueryClient();
  
  return useRealtimeSubscription({
    table: 'pages',
    filter: ownerId ? `owner_id=eq.${ownerId}` : undefined,
    queryKey: '/api/pages',
    enabled: !!ownerId
  });
}

/**
 * Hook for real-time services for a specific page
 */
export function useRealtimeServices(pageId?: string) {
  const queryClient = useQueryClient();
  
  return useRealtimeSubscription({
    table: 'services', 
    filter: pageId ? `page_id=eq.${pageId}` : undefined,
    queryKey: pageId ? ['/api/pages', pageId, 'services'] : undefined,
    enabled: !!pageId
  });
}

/**
 * Hook for real-time dashboard stats - invalidates multiple queries with debouncing
 */
export function useRealtimeDashboard(ownerId?: string) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!ownerId || !supabase) {
      return;
    }

    // Debounce function to prevent excessive invalidations
    let debounceTimeout: NodeJS.Timeout;
    const debouncedInvalidateStats = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-activity'] });
      }, 300); // 300ms debounce
    };

    // Single channel for both appointments and pages (more efficient)
    const dashboardSub = supabase
      .channel(`dashboard:${ownerId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', // Only listen to relevant events
          schema: 'public', 
          table: 'appointments',
          filter: `owner_id=eq.${ownerId}`
        }, 
        (payload: any) => {
          console.log('Dashboard: appointment created', payload.eventType);
          debouncedInvalidateStats();
          queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'appointments',
          filter: `owner_id=eq.${ownerId}`
        }, 
        (payload: any) => {
          console.log('Dashboard: appointment updated', payload.eventType);
          debouncedInvalidateStats();
          queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT',
          schema: 'public', 
          table: 'pages',
          filter: `owner_id=eq.${ownerId}`
        }, 
        (payload: any) => {
          console.log('Dashboard: page created', payload.eventType);
          debouncedInvalidateStats();
          queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE',
          schema: 'public', 
          table: 'pages',
          filter: `owner_id=eq.${ownerId}`
        }, 
        (payload: any) => {
          console.log('Dashboard: page updated', payload.eventType);
          debouncedInvalidateStats();
          queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
        }
      );

    dashboardSub.subscribe((status: any) => {
      console.log(`Dashboard realtime status:`, status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      clearTimeout(debounceTimeout);
      dashboardSub.unsubscribe();
      setIsConnected(false);
    };
  }, [ownerId, queryClient]);

  return { isConnected };
}