const autoPlayButton = document.querySelector(".auto-play");
autoPlayButton.addEventListener("click", startAutoPlay);

const stopButton = document.querySelector(".stop");
stopButton.addEventListener("click", stopAutoPlay)

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
    const response = await fetch(`http://192.168.0.96/answers?imagePath=${imagePath}`)
        .catch(e => console.error("Фильм не найден!"));
    if (response.ok) {
        const data = await response.json();
        return data;
    }

    return null;
}

async function addAnswerData(data) {
    const response = await fetch("http://192.168.0.96/answers", {
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