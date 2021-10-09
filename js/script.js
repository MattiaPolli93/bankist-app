"use strict";

// Data
const account1 = {
    owner: "Jon Neve",
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2020-04-01T10:17:24.185Z",
        "2020-05-08T14:11:59.604Z",
        "2020-05-27T17:01:17.194Z",
        "2021-07-11T23:36:17.929Z",
        "2021-10-07T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "it-IT",
};

const account2 = {
    owner: "Mario Verdi",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5, // %
    pin: 2222,
    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2021-04-10T14:43:26.374Z",
        "2021-06-25T18:49:59.371Z",
        "2021-10-05T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
};

const account3 = {
    owner: "Sansa Rossi",
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7, // %
    pin: 3333,
};

const account4 = {
    owner: "Sarah Bianchi",
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1, // %
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements - DOM
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

createUsernames(accounts);

// Event handlers
let currentAccount, timer;

btnLogin.addEventListener("click", function(e) {
    // Prevent Form from submitting
    e.preventDefault()

    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

    if (currentAccount?.pin === +inputLoginPin.value) {
        // Display UI - Welcome message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]} 😊`;
        containerApp.style.opacity = 100;

        // Create current date and time
        const now = new Date();
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
            // weekday: "long"
        };
        // const locale = navigator.language;

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        /* const now = new Date();
        const day = `${now.getDate()}`.padStart(2, "0");
        const month = `${now.getMonth() + 1}`.padStart(2, "0");
        const year = now.getFullYear();
        const hour = `${now.getHours()}`.padStart(2, "0");
        const min = `${now.getMinutes()}`.padStart(2, "0");
        labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`; */

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginPin.blur();

        // Timer
        if (timer) clearInterval(timer);
        timer = startLogoutTimer();

        // Update UI
        updateUI(currentAccount);
    }
});

// Transfers
btnTransfer.addEventListener("click", function(e) {
    e.preventDefault();
    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
    inputTransferAmount.value = inputTransferTo.value = "";

    if (amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username) {
        // Implementing transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        // Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        // Update UI
        updateUI(currentAccount);

        // Reset timer
        clearInterval(timer);
        timer = startLogoutTimer();
    }
});

// Loan - granted if any deposit is >= 10% of requested amount of loan
btnLoan.addEventListener("click", function(e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(function() {
            // Add movement
            currentAccount.movements.push(amount);

            // Add loan date
            currentAccount.movementsDates.push(new Date().toISOString());
            
            // Update UI
            updateUI(currentAccount);

            // Reset timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 3000);
    }
    inputLoanAmount.value = "";
});

// Close account
btnClose.addEventListener("click", function(e) {
    e.preventDefault();

    if (inputCloseUsername.value === currentAccount.username && +inputClosePin.value === currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);

        // Delete account
        accounts.splice(index, 1);

        // Change UI
        labelWelcome.textContent = `Farewell, ${currentAccount.owner.split(" ")[0]} 😞`
        containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin.value = "";
});

// Sort account movements
let sorted = false;

btnSort.addEventListener("click", function(e) {
    e.preventDefault();
    displayMovements(currentAccount, !sorted);
    btnSort.innerHTML = sorted ? "&downarrow; SORT" : "HISTORY";
    sorted = !sorted;
});