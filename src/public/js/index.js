import { createNewUser } from "./signup";
import { login, logout } from "./login";
import { adminUpdateUser } from "./admin-update";
import { addSelectedTrader, removeSelectedTrader, addNewTrader, deleteTrader } from './trader'
import { sendEmail } from "./email";
import { getLivePrices } from './prices.js';
import { getCryptoNews } from './news.js';
import { accountFrozenModal } from './alerts';
import { withdrawAmount } from './withdraw.js';
import { updateUserProfile } from './user-update.js';
import { updateTransaction } from "./update-transaction.js";


// Elements
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const updateButtons = document.querySelectorAll(".admin-update-button"); 
const logoutLink = document.getElementById("logoutLink");
const addTraderButton = document.querySelectorAll(".trader-update-add");
const removeTraderButton = document.querySelectorAll(".trader-update-remove");
const emailButton = document.getElementById("sendEmailButton"); 
const newTraderButton = document.getElementById("admin-new-trader"); 
const deleteTraderButtons = document.querySelectorAll(".admin-delete-trader"); 
const withdrawButton = document.querySelector('#withdrawButton');
const userUpdateProfileBtn = document.querySelector('#my-profile-update'); 
const updateTransactionBtn =document.querySelectorAll('.update-transaction-btn')

// Function to check if user account is frozen
document.addEventListener('DOMContentLoaded', () => {
  const frozenMessage = localStorage.getItem('frozenMessage');
  if (frozenMessage) {
    accountFrozenModal(frozenMessage);
    localStorage.removeItem('frozenMessage'); // Remove the item after showing the modal
  }
});

// Function to auto-update crypto prices
const updatePrices = async () => {
  const prices = await getLivePrices();
  if (prices) {
    // Update BTC price
    document.getElementById('btc-price').innerText = `$${prices.bitcoin.usd.toFixed(2)}`;
    document.getElementById('btc-change').innerText = `${prices.bitcoin.usd_24h_change.toFixed(2)}%`;

    // Update ETH price
    document.getElementById('eth-price').innerText = `$${prices.ethereum.usd.toFixed(2)}`;
    document.getElementById('eth-change').innerText = `${prices.ethereum.usd_24h_change.toFixed(2)}%`;

    // Update LTC price
    document.getElementById('ltc-price').innerText = `$${prices.litecoin.usd.toFixed(2)}`;
    document.getElementById('ltc-change').innerText = `${prices.litecoin.usd_24h_change.toFixed(2)}%`;
  }
}; 

// Function to get recent crypto news
const updateNews = async () => {
  const newsList = await getCryptoNews();
  if (newsList) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = ''; // Clear existing news

    // Provided images mapping
    const images = [
      '/assets/images/coins/01.png',
      '/assets/images/coins/09.png',
      '/assets/images/coins/06.png'
    ];

    newsList.forEach((news, index) => {
      const newsItem = document.createElement('li');
      newsItem.className = 'd-flex align-items-center pt-3';
      newsItem.innerHTML = `
        <div class="d-flex justify-content-between rounded-pill">
          <img class="img-fluid avatar avatar-40 avatar-rounded" src="${images[index]}" alt="news image">
          <div class="ms-3 flex-grow-1">
            <h5 class="mb-2">${news.title}</h5>
            <p class="fs-6">${news.description}</p>
          </div>
        </div>
      `;
      newsContainer.appendChild(newsItem);
    });
  }
};


// Fetch prices on page load
updatePrices();
// Optionally, update prices every minute
setInterval(updatePrices, 60000);
// Fetch news on page load
updateNews();
// Optionally, update news every hour
setInterval(updateNews, 3600000);

if (userUpdateProfileBtn) {
  userUpdateProfileBtn.addEventListener("click", e => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phonenum = document.getElementById("phonenum").value;
    updateUserProfile(firstName, lastName, phonenum, email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phonenum = document.getElementById("phonenum").value;
    createNewUser(firstName, lastName, phonenum, email, password);
  });
}

if (loginForm)
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });

if (updateButtons) {
  updateButtons.forEach(button => {
    button.addEventListener("click", e => {
      const userId = button.getAttribute("data-user-id");
      const index = button.getAttribute("data-index");
      adminUpdateUser(userId, index);
    });
  });
}

if (deleteTraderButtons) {
  deleteTraderButtons.forEach(button => {
    button.addEventListener("click", e => {
      const traderId = button.getAttribute("data-trader-id");
      // const index = button.getAttribute("data-index");
      deleteTrader(traderId);
    });
  });
}

if (addTraderButton) {
  addTraderButton.forEach(button => {
    button.addEventListener('click', async e => {
      try {
        const userId = button.getAttribute('data-user-id')
        const traderId = button.getAttribute('data-trader-id')
        const userIndex = button.getAttribute('data-trader-pug')
        const selectType = button.getAttribute('data-select-type')
        await addSelectedTrader(userId, traderId, userIndex, selectType)
      } catch (e) {
        console.log(e.message)
      }
      
    })
  })
}

if (updateTransactionBtn) {
  updateTransactionBtn.forEach(button => {
    button.addEventListener('click', async (e) => {
    e.preventDefault()
    const transactionId = button.getAttribute('data-transaction-id')
    const index = button.getAttribute('data-index')
    console.log(transactionId, index)
    await updateTransaction(transactionId, index)
  }) 
  }) 
}

if (removeTraderButton) {
  removeTraderButton.forEach(button => {
    button.addEventListener('click', async e => {
      try {
        const userId = button.getAttribute('data-user-id')
        const traderId = button.getAttribute('data-trader-id')
        const userIndex = button.getAttribute('data-trader-pug')
        const selectType = button.getAttribute('data-select-type')
        await removeSelectedTrader(userId, traderId, userIndex, selectType)
      } catch (e) {
        console.log(e.message)
      }
      
    })
  })
}

if (logoutLink) {
  logoutLink.addEventListener("click", e => {
    e.preventDefault();
    logout();
  });
}

if (emailButton) {
  emailButton.addEventListener("click", e => {
    e.preventDefault();
    const depositAmount = document.querySelector('#withdrawInput').value
    const userId = emailButton.getAttribute('data-user-id');
    sendEmail(userId, depositAmount);
  });
}

if (newTraderButton) {
  newTraderButton.addEventListener('click', e => {
    e.preventDefault()
    const name = document.getElementById('new-trader-name').value
    const winRate = document.getElementById('new-trader-winrate').value
    const profitShare = document.getElementById('new-trader-profitshare').value
    const avatarFile = document.querySelector('#customFile').files[0]; // Get the file from input
    addNewTrader(name, winRate, profitShare, avatarFile)
  })
}

if (withdrawButton) {
  const withdrawInput = document.querySelector('#withdrawInput');
  withdrawButton.addEventListener('click', async () => {
    const amount = withdrawInput.value;
    const userId = withdrawButton.getAttribute('data-user-id');
    await withdrawAmount(amount, userId);
  });
}
