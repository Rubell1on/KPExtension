let ip = localStorage.getItem("ip");

if (!ip) {
    ip = "http://192.168.0.96";
    localStorage.setItem("ip", ip);
}

const autoPlayButton = document.querySelector(".auto-play");
autoPlayButton.addEventListener("click", startAutoPlay);

const stopButton = document.querySelector(".stop");
stopButton.addEventListener("click", stopAutoPlay);

const delayInput = document.querySelector(".delay");
delayInput.addEventListener("change", setDelay);

const ipInput = document.querySelector(".ip");
ipInput.value = ip;
ipInput.addEventListener("change", setIp)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
        case "getQuestionInfo":
            getAnswerByImagePath(request.data.imagePath)
                .then(response => sendResponse(response));
            
            break;
        
        case "addQuestionInfo":
            addAnswerData(request.data)
                .then(added => {
                    if (added) console.log("Добавлено!", request.data);
                    sendResponse(null);
                });
            
            break;

    } 
    
    return true;
});

async function getAnswerByImagePath(imagePath) {
    const response = await fetch(`${ip}/answers?imagePath=${imagePath}`)
        .catch(e => console.error("Фильм не найден!"));
    if (response.ok) {
        const data = await response.json();
        return data;
    }

    return null;
}

async function addAnswerData(data) {
    const response = await fetch(`${ip}/answers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .catch(e => console.error("Ошибка при добавлении данных!"));

    if (response.ok) {
        return true;
    }

    return false;
}

async function startAutoPlay() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "start" });
    });
}

function stopAutoPlay() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "stop" });
    });
}

function setDelay(e) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "setDelay", value: e.target.value });
    });
}

function setIp(e) {
    ip = e.target.value;
    localStorage.setItem("ip", ip);
    console.log(`IP: ${ip} записан в хранилище!`);
}