"use strict";

// Logout timer
const startLogoutTimer = function() {
    const tick = function() {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);

        labelTimer.textContent = `${min}:${sec}`;

        // Stop timer and log out user
        if (time === 0) {
            setTimeout(() => labelWelcome.textContent = "Log in to get started", 5000);
            
            clearInterval(timer);

            labelWelcome.textContent = "You have successfully logged out!";
            containerApp.style.opacity = 0;
        }

        time--;
    };

    // Set time to 5 minutes
    let time = 300;

    // Call timer every second
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
};

// Format date
const formatMovementDate = function(date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    
    /* const day = `${date.getDate()}`.padStart(2, "0");
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; */

    return new Intl.DateTimeFormat(locale).format(date);
};

// Format currency
const formatCur = function(value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency
    }).format(value);
};

// Banking movements
const displayMovements = function(acc, sort = false) {
    containerMovements.innerHTML = "";

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    movs.forEach(function(mov, i) {
        const type = mov > 0 ? "deposit" : "withdrawal";
        
        const date = new Date(acc.movementsDates[i]);
        const displayDate = formatMovementDate(date, acc.locale);

        const formattedMov = formatCur(mov, acc.locale, acc.currency);

        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>
        `;

        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

// Display calculated balance
const calcDisplayBalance = function(acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// Show summaries below
const calcDisplaySummary = function(acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter(int => {
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

// Create Username
const createUsernames = function(accs) { // Accounts
    accs.forEach(function(acc) {
        acc.username = acc.owner
        .toLowerCase()
        .split(" ")
        .map(name => name[0])
        .join("");
    })
};

// Update UI (movements, balance, summary)
const updateUI = function(acc) {
    // Display movements
    displayMovements(acc);

    // Display balance
    calcDisplayBalance(acc);

    // Display summary
    calcDisplaySummary(acc);
};