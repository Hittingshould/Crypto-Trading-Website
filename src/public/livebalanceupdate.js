// Websocket to dynamically update user balance

const updateBalance = (balance) => {
    const balanceElement = document.getElementById('balanceElement');
    if (balanceElement) {
      balanceElement.innerText = `$${balance}`;
    }
  };
  
  const ws = new WebSocket(`wss://${window.location.host}?userId=${uniqueUserId}`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.userId === uniqueUserId) {
      updateBalance(data.balance);
    }
  };
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
