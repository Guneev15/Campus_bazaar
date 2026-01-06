import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false // We will connect manually when user is authenticated
});
