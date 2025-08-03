'use client';

import { useState, useEffect } from 'react';
import { Calendar, Check, Loader2, X, RefreshCw, Plus } from 'lucide-react';
import { trpc } from '../../providers/trpc-provider';
import { useToast } from '../Toast';

interface GoogleCalendarConnectProps {
  organizationId: string;
  onSuccess?: () => void;
}

export default function GoogleCalendarConnect({ organizationId, onSuccess }: GoogleCalendarConnectProps) {
  const { addToast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  // Get user ID from localStorage
  const getUserId = () => {
    const user = localStorage.getItem('pulse_user');
    if (user) {
      try {
        return JSON.parse(user).id || 'system';
      } catch (e) {
        return 'system';
      }
    }
    return 'system';
  };

  // Check connection status
  const { data: connectionStatus, refetch: refetchStatus } = trpc.googleCalendar.getConnectionStatus.useQuery(
    { organizationId },
    { 
      enabled: !!organizationId,
      refetchInterval: false,
    }
  );

  // List calendar events
  const { data: eventsData, isLoading: loadingEvents, refetch: refetchEvents } = trpc.googleCalendar.listEvents.useQuery(
    { 
      organizationId,
      timeMin: new Date().toISOString(),
      maxResults: 5,
    },
    { 
      enabled: !!organizationId && connectionStatus?.connected && showEvents,
    }
  );

  // Disconnect mutation
  const disconnectMutation = trpc.googleCalendar.disconnect.useMutation({
    onSuccess: () => {
      addToast('Google Calendar disconnected', 'success');
      refetchStatus();
      setShowEvents(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to disconnect', 'error');
    },
  });

  // Sync job to calendar mutation
  const syncJobMutation = trpc.googleCalendar.syncJobToCalendar.useMutation({
    onSuccess: () => {
      addToast('Job synced to Google Calendar', 'success');
      refetchEvents();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to sync job', 'error');
    },
  });

  // Handle connect button click
  const handleConnect = () => {
    setConnecting(true);
    const userId = getUserId();
    
    // Check for query params to handle callback
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const integration = urlParams.get('integration');
    
    if (status === 'connected' && integration === 'google-calendar') {
      // Just connected, refresh status
      refetchStatus();
      setConnecting(false);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Redirect to OAuth flow
    window.location.href = `/api/auth/google-calendar?organizationId=${organizationId}&userId=${userId}&returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      await disconnectMutation.mutateAsync({ organizationId });
    }
  };

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const integration = urlParams.get('integration');
    const message = urlParams.get('message');
    const error = urlParams.get('error');
    
    if (integration === 'google-calendar') {
      if (status === 'connected' || status === 'demo-connected') {
        addToast(message || 'Google Calendar connected successfully', 'success');
        refetchStatus();
        if (onSuccess) onSuccess();
      } else if (error) {
        addToast(decodeURIComponent(message || 'Failed to connect Google Calendar'), 'error');
        setConnecting(false);
      }
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Demo: Create a sample job event
  const handleCreateDemoEvent = () => {
    syncJobMutation.mutate({
      organizationId,
      jobId: 'demo-job-1',
      jobTitle: 'Kitchen Renovation - Smith Residence',
      jobDescription: 'Complete kitchen remodel including cabinets, countertops, and appliances',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      duration: 120, // 2 hours
    });
  };

  if (!connectionStatus) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Google Calendar</h3>
            <p className="text-sm text-gray-400">
              {connectionStatus.connected ? 'Connected' : 'Sync events and deadlines with Google Calendar'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus.connected ? (
            <>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                Connected
              </span>
              <button
                onClick={handleDisconnect}
                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                title="Disconnect"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Connect Google Calendar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {connectionStatus.connected && (
        <>
          {connectionStatus.connectedAt && (
            <div className="text-sm text-gray-400 mb-4">
              Connected since: {new Date(connectionStatus.connectedAt).toLocaleDateString()}
              {connectionStatus.email && ` • ${connectionStatus.email}`}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {showEvents ? 'Hide' : 'Show'} Upcoming Events
            </button>
            <button
              onClick={handleCreateDemoEvent}
              disabled={syncJobMutation.isLoading}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Sync Demo Job
            </button>
            <button
              onClick={() => refetchEvents()}
              disabled={loadingEvents}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {showEvents && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Upcoming Events</h4>
              {loadingEvents ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : eventsData?.events && eventsData.events.length > 0 ? (
                <div className="space-y-2">
                  {eventsData.events.map((event: any) => (
                    <div key={event.id} className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="text-white font-medium text-sm">{event.summary || 'Untitled Event'}</h5>
                          {event.description && (
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{event.description}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                          </p>
                        </div>
                        {event.summary?.includes('[PulseCRM]') && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                            CRM
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No upcoming events found</p>
              )}
            </div>
          )}
        </>
      )}

      {!connectionStatus.connected && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Features</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Automatically sync job deadlines to your calendar</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Get reminders for upcoming tasks and meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Two-way sync keeps everything up to date</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span>View your schedule without leaving PulseCRM</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}