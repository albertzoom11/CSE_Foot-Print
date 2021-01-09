// listen for auth status changes
const heatmapBody = document.getElementById('heatmapBody');
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in: ', user);
        setupUI(user);
        // get data
        db.collection('users').doc(auth.currentUser.uid).collection('footprints').onSnapshot(snapshot => {
            if ( document.URL.includes("heatMap.html") ) {
                console.log("docs 1: ", snapshot.docs);
                snapshot.query.orderBy("date", "desc").get()
                .then((querySnapshot) => {
                    console.log("querySnapshot: ", querySnapshot);
                    snapshot = querySnapshot;
                    console.log("docs 2:", snapshot.docs);
                    setupLogs(snapshot.docs);
                })
                .catch((error) => {
                    console.error(error);
                });
            }
        });
    } else {
        console.log('user logged out');
        setupUI();
    }
});

// create entry
const createEntry = document.querySelector('#create-form');
createEntry.addEventListener('submit', e => {
    e.preventDefault();
    
    // create entry
    db.collection('users').doc(auth.currentUser.uid).collection('footprints').add({
        // get entry info
        date: createEntry['date'].value,
        rightBall: createEntry['rightBall'].value,
        rightArchFront: createEntry['rightArchFront'].value,
        rightArchBack:createEntry['rightArchBack'].value,
        rightHeel: createEntry['rightHeel'].value,
        leftBall: createEntry['leftBall'].value,
        leftArchFront: createEntry['leftArchFront'].value,
        leftArchBack: createEntry['leftArchBack'].value,
        leftHeel: createEntry['leftHeel'].value
    }).then((docReference) => {
        console.log('created entry');
        // close modal and reset
        const modal = document.querySelector('#modal-create');
        M.Modal.getInstance(modal).close();
        createEntry.reset();
    }).catch(err => {
        console.log(err.message);
    });
});

// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    // create user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        return db.collection('users').doc(cred.user.uid).set({
            name: signupForm['signup-name'].value
        });
    }).then(() => {
        console.log('created user');
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
    });
});

// logout
const logout = document.querySelector('#logoutNav');
logout.addEventListener('click', e => {
    if ( document.URL.includes("heatMap.html") ) {
        e.preventDefault();

        // sign out
        auth.signOut().then(() => {
            console.log('signed out from heat map');
            window.location.href = "../index.html";
        });
    } else {
        e.preventDefault();
    
        // sign out
        auth.signOut().then(() => {
            console.log('signed out');
        });
    }
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    // log user in
    auth.signInWithEmailAndPassword(email, password).then(cred => {
        console.log('logged in');
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
    });
});