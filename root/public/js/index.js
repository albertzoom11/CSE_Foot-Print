const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const footprintLogs = document.querySelector('.footprintLogs');

const setupUI = (user) => {
    if (user) {
        // account info
        db.collection('users').doc(user.uid).get().then(doc => {
            const html = `
                <div>Hello ${doc.data().name}!</div><br>
                <div>You are logged in as ${user.email}</div>
            `;
            accountDetails.innerHTML = html;
        });

        // toggle UI elements
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
        if (document.URL.includes("heatMap.html")) {
            heatmapBody.style.visibility = 'visible';
        };
    } else {
        // hide account info
        accountDetails.innerHTML = '';

        // toggle UI elements
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
        if (document.URL.includes("heatMap.html")) {
            heatmapBody.style.visibility = 'hidden';
        };
    };
};

// turn date type into word form of the date
const wordify = (date) => {
    // get date info
    const year = date.substring(0, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);

    // create word variables
    var wordMonth;
    var wordDay = day;

    // find word form of the month
    if (month.substring(0, 1) === '0') {
        if (month === '01') {
            wordMonth = 'January';
        } else if (month === '02') {
            wordMonth = 'February';
        } else if (month === '03') {
            wordMonth = 'March';
        } else if (month === '04') {
            wordMonth = 'April';
        } else if (month === '05') {
            wordMonth = 'May';
        } else if (month === '06') {
            wordMonth = 'June';
        } else if (month === '07') {
            wordMonth = 'July';
        } else if (month === '08') {
            wordMonth = 'August';
        } else if (month === '09') {
            wordMonth = 'September';
        }
    } else if (month === '10') {
        wordMonth = 'October';
    } else if (month === '11') {
        wordMonth = 'November';
    } else if (month === '12') {
        wordMonth = 'December';
    };

    // find word form of the day
    if (day.substring(0, 1) === '1') {
        wordDay += 'th';
    } else {
        if (day.substring(1, 2) === '1') {
            wordDay += 'st';
        } else if (day.substring(1, 2) === '2') {
            wordDay += 'nd';
        } else if (day.substring(1, 2) === '3') {
            wordDay += 'rd';
        } else {
            wordDay += 'th';
        };
    }

    // check for leading zero
    if (day.substring(0, 1) === '0') {
        wordDay = wordDay.substring(1, 4);
    };

    // return word form of date
    return wordMonth + ' ' + wordDay + ', ' + year;
};

// setup footprint log
const setupLogs = (data) => {
    let html = '';
    data.forEach(doc => {
        const entry = doc.data();
        const wordDate = wordify(entry.date);
        const li = `
    <li>
        <div class="collapsible-header waves-effect waves-light teal accent-3" onclick="setFootprint('${doc.id}')"><h6 style="margin: 0 auto;">${wordDate}</h6></div>
        <div class="collapsible-body teal accent-1">
            <table class="centered responsive-table">
                <thead>
                    <tr>
                        <th></th>
                        <th><h6>Ball</h6></th>
                        <th><h6>Front Arch</h6></th>
                        <th><h6>Back Arch</h6></th>
                        <th><h6>Heel</h6></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th><h6>Right Foot</h6></th>
                        <td><h6>${entry.rightBall}</h6></td>
                        <td><h6>${entry.rightArchFront}</h6></td>
                        <td><h6>${entry.rightArchBack}</h6></td>
                        <td><h6>${entry.rightHeel}</h6></td>
                    </tr>
                    <tr>
                        <th><h6>Left Foot</th>
                        <td><h6>${entry.leftBall}</h6></td>
                        <td><h6>${entry.leftArchFront}</h6></td>
                        <td><h6>${entry.leftArchBack}</h6></td>
                        <td><h6>${entry.leftHeel}</h6></td>
                    </tr>
                </tbody>
            </table>
            <br>
            <i class="material-icons small click-icon" onclick="deletify('${doc.id}')">delete</i>
        </div>
    </li>
    `;
        html += li;
    });
    footprintLogs.innerHTML = html;
};

// setup materialize components
document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
});

// confirmation
const confirmationForm = document.querySelector('#deletify-form');
confirmationForm.addEventListener('click', e => {
    e.preventDefault();
    
    const modal = document.querySelector('#modal-deletify');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
});

// delete entry
var globalDeleteDoc;
const deletify = (id) => {
    globalDeleteDoc = id;
    $('#modal-deletify').modal('open');     
};

const deleete = () => {
    db.collection("users").doc(auth.currentUser.uid).collection('footprints').doc(globalDeleteDoc).delete().then(function() {
        console.log("Entry successfully deleted!");
        const modal = document.querySelector('#modal-deletify');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
    }).catch(function(error) {
        console.error("Error removing entry: ", error);
    });
};