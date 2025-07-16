const cron = require("node-cron");
const WebSocket = require('ws')
const User = require("../model/user");

const MIN_BALANCE = 500;
const MAX_BALANCE = 150000;
const BALANCE_THRESHOLD = 500;

const generateRandomBalance = () => {
  return Math.floor(Math.random() * (MAX_BALANCE - MIN_BALANCE + 1)) + MIN_BALANCE;
};

const updateBalances = async (clients) => {
  try {
    if (!clients) {
      console.log("No clients connected. Skipping");
      return;
    }
    const users = await User.find();

    for (const user of users) {
      if (user.autoUpdateBalance) {
        let newBalance = generateRandomBalance();
        newBalance = Math.max(newBalance, BALANCE_THRESHOLD);
        user.balance = newBalance;
        await user.save();

        const client = clients.get(user._id.toString());
        
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ userId: user._id, balance: newBalance }));
        } else {
          console.warn(`WebSocket client not found for user ${user._id}`);
        }
      }
    }
    console.log("User balances updated successfully");
  } catch (error) {
    console.error("Error updating user balances:", error);
  }
};

const hourlyBalanceUpdateTask = (clients) => {
  cron.schedule("0 * * * *", async () => {
    await updateBalances(clients);
  });
};

module.exports = hourlyBalanceUpdateTask;
