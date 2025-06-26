
const socket = new WebSocket('ws://localhost:8080');



socket.onopen = () => {
    console.log('WebSocket connection established');
};


socket.onmessage = (event) => {

    console.log('Message from server:', event);

    const data = JSON.parse(event.data);
    console.log('Message from server:', data);

};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};

export default socket;