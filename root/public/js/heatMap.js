var heatmap;
var containerElement = document.getElementById("heatmapContainer");
var widths;
var heights;
var wrapperWidth;
var wrapperHeight;

window.onload = () => {
    wrapperWidth = document.getElementById("heatmapContainer").offsetWidth
    wrapperHeight = document.getElementById("heatmapContainer").offsetHeight
    
    heatmap = h337.create({
        container: containerElement,
        radius: Math.round(wrapperHeight * 0.15),
        backgroundColor: "#d1fffb66",
        gradient: {
            // enter n keys between 0 and 1 here
            // for gradient color customization
            '0': '#d1fffb',
            '0.5': 'rgb(0,0,255)',
            '0.7': 'rgb(0,255,0)',
            '0.85': 'yellow',
            '0.95': 'rgb(255,0,0)'
          }
    });

    widths = [Math.round(wrapperWidth * 0.27), Math.round(wrapperWidth * 0.15), Math.round(wrapperWidth * 0.2), Math.round(wrapperWidth * 0.3)];
    heights = [Math.round(wrapperHeight * 0.35), Math.round(wrapperHeight * 0.525), Math.round(wrapperHeight * 0.72), Math.round(wrapperHeight * 0.85)];

    console.log(heatmap);
};

var setFootprint = (docName) => {
    db.collection('users').doc(auth.currentUser.uid).collection("footprints").doc(docName).get()
    .then((docSnapshot) => {
        var footprint = docSnapshot.data();

        feet = analyzeFootprint(footprint);
        var maxVal = feet.reduce((a, b) => {
            return Math.max(a, b);
        });

        heatmap.setData({
        max: 1.1 * maxVal,
        min: 0,
        data: [{x: widths[0], y: heights[0], value: footprint.leftBall},
            {x: widths[1], y: heights[1], value: footprint.leftArchFront},
            {x: widths[2], y: heights[2], value: footprint.leftArchBack},
            {x: widths[3], y: heights[3], value: footprint.leftHeel},
            {x: wrapperWidth - widths[0], y: heights[0], value: footprint.rightBall},
            {x: wrapperWidth - widths[1], y: heights[1], value: footprint.rightArchFront},
            {x: wrapperWidth - widths[2], y: heights[2], value: footprint.rightArchBack},
            {x: wrapperWidth - widths[3], y: heights[3], value: footprint.rightHeel}]
        });
    })
    .catch((error) => {
        console.error("error retrieving data: ", error);
    });
};

var clearFootprint = () => {
    heatmap.setData({
        max: 0,
        min: 0,
        data: []
    });
    document.getElementById("leftUserFeedback").innerText = "";
    document.getElementById("rightUserFeedback").innerText = "";
}

// ideal is the numerator of the ideal percentag
var singleForceState = (value, total, ideal) => {
    const tolerance = 5;
    var output;
    if (value <= (ideal - tolerance)/100 * total) {
        output = -1;
    } else if (value <= (ideal + tolerance)/100 * total) {
        output = 0;
    } else {
        output = 1;
    }
    console.log('single force state: ' + output);
    return output;
}

// ideally, distribution should be 40-20-10-30 ball-front arch-back arch-heel. tolerance is how far off you can be until the program says it's bad
var forceState = (foot) => {
    var output = [];
    
    var total = 0;
    foot.forEach(force => {
        total += force;
    })
    
    console.log('total: ' + total);
    
    output.push(singleForceState(foot[0], total, 40));
    output.push(singleForceState(foot[1], total, 20));
    output.push(singleForceState(foot[2], total, 10));
    output.push(singleForceState(foot[3], total, 30));
    
    console.log('force state: ' + output);
    
    return output;
};

var analyzeFootprint = (footprint) => {
    // create array of force values for each foot
    var leftFoot = [parseInt(footprint.leftBall), parseInt(footprint.leftArchFront), parseInt(footprint.leftArchBack), parseInt(footprint.leftHeel)];
    var rightFoot = [parseInt(footprint.rightBall), parseInt(footprint.rightArchFront), parseInt(footprint.rightArchBack), parseInt(footprint.rightHeel)];
    
    console.log('leftFoot: ' + leftFoot);
    console.log('rightFoot: ' + rightFoot);
    
    // create array of force states for each foot
    var leftFootState = forceState(leftFoot);
    var rightFootState = forceState(rightFoot);
    
    console.log('leftFootState: ' + leftFootState);
    console.log('rightFootState: ' + rightFootState);
    
    // outputted feedback message
    var leftArchMsg, leftLeanMsg, rightArchMsg, rightLeanMsg;
    
    // left foot front-back message
    if (leftFootState[0] + leftFootState[1] > 0 && leftFootState[2] + leftFootState[3] < 0) { // if the front of the left foot has too much force on it
        leftLeanMsg = "You are putting too much force on the front of your left foot. You should try to fix this by putting more force on your heel.";
    } else if (leftFootState[0] + leftFootState[1] < 0 && leftFootState[2] + leftFootState[3] > 0) { // if the left foot front-back force distribution is good
        leftLeanMsg = "You are putting too much force on the back of your left foot. You should try to fix this by running more on your toes.";
    } else if (leftFootState[0] + leftFootState[1] === 0 && leftFootState[2] + leftFootState[3] < 0) { // if the front of the left foot has too little force on it
        leftLeanMsg = "You are putting too much force on the front of your left foot. You should try to fix this by putting more force on your heel.";
    } else if (leftFootState[0] + leftFootState[1] === 0 && leftFootState[2] + leftFootState[3] > 0) { // if the front of the left foot has too little force on it
        leftLeanMsg = "You are putting too much force on the back of your left foot. You should try to fix this by running more on your toes.";
    } else if (leftFootState[0] + leftFootState[1] < 0 && leftFootState[2] + leftFootState[3] === 0) { // if the front of the left foot has too little force on it
        leftLeanMsg = "You are putting too much force on the back of your left foot. You should try to fix this by running more on your toes.";
    } else if (leftFootState[0] + leftFootState[1] > 0 && leftFootState[2] + leftFootState[3] === 0) { // if the front of the left foot has too little force on it
        leftLeanMsg = "You are putting too much force on the front of your left foot. You should try to fix this by putting more force on your heel.";
    } else {
        leftLeanMsg = "You have a good front-back distribution of force across your left foot.";
    };
    
    // right foot front-back message
    if (rightFootState[0] + rightFootState[1] > 0 && rightFootState[2] + rightFootState[3] < 0) { // if the front of the right foot has too much force on it
        rightLeanMsg = "You are putting too much force on the front of your right foot. You should try to fix this by putting more force on your heel.";
    } else if (rightFootState[0] + rightFootState[1] < 0 && rightFootState[2] + rightFootState[3] > 0) { // if the right foot front-back force distribution is good
        rightLeanMsg = "You are putting too much force on the back of your right foot. You should try to fix this by running more on your toes.";
    } else if (rightFootState[0] + rightFootState[1] === 0 && rightFootState[2] + rightFootState[3] < 0) { // if the front of the right foot has too little force on it
        rightLeanMsg = "You are putting too much force on the front of your right foot. You should try to fix this by putting more force on your heel.";
    } else if (rightFootState[0] + rightFootState[1] === 0 && rightFootState[2] + rightFootState[3] > 0) { // if the front of the right foot has too little force on it
        rightLeanMsg = "You are putting too much force on the back of your right foot. You should try to fix this by running more on your toes.";
    } else if (rightFootState[0] + rightFootState[1] < 0 && rightFootState[2] + rightFootState[3] === 0) { // if the front of the right foot has too little force on it
        rightLeanMsg = "You are putting too much force on the back of your right foot. You should try to fix this by running more on your toes.";
    } else if (rightFootState[0] + rightFootState[1] > 0 && rightFootState[2] + rightFootState[3] === 0) { // if the front of the right foot has too little force on it
        rightLeanMsg = "You are putting too much force on the front of your right foot. You should try to fix this by putting more force on your heel.";
    } else {
        rightLeanMsg = "You have a good front-back distribution of force across your right foot.";
    };
    
    // left foot arch message
    if (leftFootState[2] + leftFootState[1] > 0) { // if the front of the left foot has too much force on it
        leftArchMsg = "\nYour left foot is flat-footed. You should try to fix this by putting less force on your arch.";
    } else if (leftFootState[2] + leftFootState[1] === 0) { // if the left foot front-back force distribution is good
        leftArchMsg = "\nYou are putting a good amount of force on the arch of your left foot.";
    } else { // if the front of the left foot has too little force on it
        leftArchMsg = "\nYour left foot is too curved. You should try to fix this by putting more force on your arch.";
    };
    
    // right foot arch message
    if (rightFootState[2] + rightFootState[1] > 0) { // if the front of the right foot has too much force on it
        rightArchMsg = "\nYour right foot is flat-footed. You should try to fix this by putting less force on your arch.";
    } else if (rightFootState[2] + rightFootState[1] === 0) { // if the right foot front-back force distribution is good
        rightArchMsg = "\nYou are putting a good amount of force on the arch of your right foot.";
    } else { // if the front of the right foot has too little force on it
        rightArchMsg = "\nYour right foot is too curved. You should try to fix this by putting more force on your arch.";
    };
    
    document.getElementById("leftUserFeedback").innerText = leftLeanMsg + leftArchMsg;
    document.getElementById("rightUserFeedback").innerText = rightLeanMsg + rightArchMsg;
    
    return leftFoot.concat(rightFoot);
};

window.onresize = () => {
    console.log(heatmap);
    containerElement.removeChild(containerElement.childNodes[0]);
    document.getElementById("leftUserFeedback").innerText = "";
    document.getElementById("rightUserFeedback").innerText = "";
    window.onload();
};