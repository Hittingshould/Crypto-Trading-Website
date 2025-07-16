const Mailjet = require('node-mailjet');

const mj = Mailjet.apiConnect(
  process.env.MAILJET_API,
  process.env.MAILJET_SECRET
);

const sendEmail = (to, subject, text) => {
  const request = mj.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "support@coinblazers.com",
          Name: "CoinBlazers"
        },
        To: [
          {
            Email: to,
            Name: 'Recipient Name'
          }
        ],
        Subject: subject,
        TextPart: text
      }
    ]
  });

  request.then().catch(err => {
    console.log(err.statusCode);
  });
};


const generateUserWithdrawalEmail = (userFirstName, userLastName, amount) => {
  return `
    Dear ${userFirstName} ${userLastName},

    We have received your withdrawal request of $${amount}. Your request is currently being processed.

    We will notify you once the withdrawal has been completed and the amount has been transferred to your wallet.

    Thank you for your patience.

    Best regards,
    CoinBlazers
  `;
};

const generateAdminWithdrawalEmail = (userFirstName, userLastName, amount) => {
  return `
    Withdrawal Request Notification

    User: ${userFirstName} ${userLastName}
    Amount: $${amount}

    The user has requested a withdrawal of $${amount}. Please process this request at your earliest convenience.

    Best regards,
    CoinBlazers System
  `;
};

const generateDepositUserEmail = (userFirstName, userLastName) => {
  return `
    Dear ${userFirstName} ${userLastName},

    We have received your transaction and it is currently pending review. Our team is diligently working to verify the details, and we will notify you as soon as the process is complete.

    Please allow some time for the review. We appreciate your understanding and patience during this process.

    If you have any questions or need further assistance, feel free to contact our support team.

    Best regards,
    CoinBlazers Support Team
  `;
};

const generateDepositSupportEmail = (userFirstName, userLastName, transactionAmount, useremail) => {
  return `
    Support Team,

    A new transaction has been made by ${userFirstName} ${userLastName}, with email address ${useremail}

    The transaction details are as follows:

    Amount: ${transactionAmount}

    Please review and process the transaction as soon as possible.

    Thank you,
    CoinBlazers System Notification
  `;
};

const generateDepositApprovedEmail = (userFirstName, userLastName, amount) => {
  return `
    Dear ${userFirstName} ${userLastName},

    We are pleased to inform you that your deposit of ${amount} has been successfully approved and credited to your trading account.

    Thank you for choosing CoinBlazers.

    Best regards,
    CoinBlazers
  `;
};

const generateDepositDeclinedEmail = (userFirstName, userLastName, amount) => {
  return `
    Dear ${userFirstName} ${userLastName},

    We regret to inform you that your deposit of ${amount} could not be processed and has been declined.

    Please contact our support team for further assistance.

    Best regards,
    CoinBlazers
  `;
};

const generateWithdrawalApprovedEmail = (userFirstName, userLastName, amount) => {
  return `
    Dear ${userFirstName} ${userLastName},

    Your withdrawal request of ${amount} has been successfully processed and the funds have been transferred to your designated account.

    Thank you for using CoinBlazers.

    Best regards,
    CoinBlazers
  `;
};

const generateWithdrawalDeclinedEmail = (userFirstName, userLastName, amount) => {
  return `
    Dear ${userFirstName} ${userLastName},

    We regret to inform you that your withdrawal request of ${amount} has been declined.

    Please contact our support team for further details.

    Best regards,
    CoinBlazers
  `;
};

const generateWelcomeEmail = (userFirstName) => {
  return `
    Dear ${userFirstName},

    Welcome to CoinBlazers!

    We’re absolutely thrilled to have you on board. At CoinBlazers, we strive to provide you with a seamless and secure experience as you navigate the exciting world of cryptocurrencies.

    Whether you’re here to trade, invest, or explore new financial opportunities, we’re here to support you every step of the way. Our platform is designed to be user-friendly and packed with the features you need to succeed.

    To get started, we recommend exploring our dashboard and familiarizing yourself with the tools available to you. If you have any questions or need assistance, our support team is always ready to help.

    Thank you for choosing CoinBlazers as your trusted partner in your financial journey. We’re excited to see you succeed!

    Warm regards,
    The CoinBlazers Team
  `;
};

module.exports = { sendEmail, generateDepositUserEmail, generateDepositDeclinedEmail,
                  generateAdminWithdrawalEmail, generateUserWithdrawalEmail,
                  generateDepositSupportEmail, generateDepositApprovedEmail,
                  generateWithdrawalApprovedEmail, generateWithdrawalDeclinedEmail,
                  generateWelcomeEmail};
