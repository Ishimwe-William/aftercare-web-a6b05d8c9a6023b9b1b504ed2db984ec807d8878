import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDashboardStats, fetchRecentActivity } from '../features/dashboard/dashboardSlice';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Custom React hook to manage a SockJS/STOMP WebSocket connection.
 * Automatically connects, subscribes, and handles cleanup.
 * @param {boolean} enabled - Flag to control connection state.
 */
export const useWebSocket = (enabled) => {
    const dispatch = useDispatch();
    // Use useRef to hold the mutable STOMP client instance
    const stompClientRef = useRef(null);

    useEffect(() => {
        // --- 1. Disconnect/Cleanup previous instance if disabled ---
        if (!enabled) {
            if (stompClientRef.current) {
                // Use deactivate() for the modern @stomp/stompjs Client
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            return;
        }

        // --- 2. Initialize and Configure the Modern STOMP Client ---
        const stompClient = new Client({
            // Use webSocketFactory for integration with SockJS
            webSocketFactory: () => {
                // *** FIX APPLIED HERE ***
                // The URL MUST match the Spring Boot endpoint defined in WebSocketConfig.java: /ws
                return new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
            },

            // Log connection details for debugging
            debug: (str) => {
                // console.log(new Date(), str);
            },

            // Callback fired once the connection is successfully established
            onConnect: () => {
                console.log('STOMP: Successfully connected and authenticated.');

                // --- Subscribe to relevant topics inside onConnect ---

                // Subscription 1: Task Updates
                // Fetches dashboard stats on any task change
                stompClient.subscribe('/topic/tasks', () => {
                    dispatch(fetchDashboardStats());
                    console.log('STOMP: Received /topic/tasks update. Dispatching fetchDashboardStats.');
                });

                // Subscription 2: Activity Feed Updates
                // Fetches recent activity on any activity change
                stompClient.subscribe('/topic/activity', (message) => {
                    // message is the modern Message object
                    dispatch(fetchRecentActivity());
                    console.log('STOMP: Received /topic/activity update. Dispatching fetchRecentActivity.');
                });

                // Add more subscriptions as needed
            },

            // Handle errors
            onStompError: (frame) => {
                console.error('STOMP Error: Broker reported error: ' + frame.headers['message']);
                console.error('STOMP Error: Additional details: ' + frame.body);
            },

            // Handle disconnection (e.g., attempt reconnect)
            onDisconnect: () => {
                console.log('STOMP: Disconnected.');
            }
        });

        // --- 3. Activate the Client (Start the connection process) ---
        stompClient.activate();
        stompClientRef.current = stompClient;

        // --- 4. Cleanup function for when the component unmounts or dependencies change ---
        return () => {
            if (stompClientRef.current) {
                // Use deactivate() for proper cleanup and closing the connection
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                console.log('STOMP: Client deactivated.');
            }
        };

        // Dependencies: dispatch is stable; enabled controls connection logic.
    }, [enabled, dispatch]);
};