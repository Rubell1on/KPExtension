let time = 1.5;
let playing = false;
let counter = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
        case "start":
            playing = true;
            const playButton = document.querySelector(".game__promo-button_play");
    
            if (!playButton) {
                console.log("Кнопка не найдена!");
            }
    
            playButton.click();
            play();

            break;

        case "stop":
            playing = false;
            break;
    }
});


function play() {
    if (playing) {
        setTimeout(() => {
            const img = document.querySelector(".game__test-image-img");
            const answers = document.querySelectorAll(".game__test-answers-item");

            if (img && answers.length) {
                const data = getInfo(img, answers);

                chrome.runtime.sendMessage({type: "getQuestionInfo", data}, function (response) {
                    if (response?.correctAnswer) {
                        const filtered = Array.from(answers).filter(e => e.innerText === response.correctAnswer);
                        if (filtered.length) {
                            console.log("Запись есть");
                            filtered[0].click();
                            counter++;
                            play();
                        } else {
                            random();
                        }
                    } else {
                        random();
                    }

                    function random() {
                        const id = randomIntFromInterval(0, 3);
                        answers[id].click();
                        console.log("Рандом");
                        setTimeout(() => {
                            const title = document.querySelector(".modal-wrong-answer__title");

                            const restartButton = document.querySelector(".modal-wrong-answer__restart-button");
                            if (restartButton) {
                                const result = title.innerText.match(/— (.*?)\./g);
                                const filmName = result[0].slice(2, result[0].length - 1);
                                data.correctAnswer = filmName;
                                chrome.runtime.sendMessage({type: "addQuestionInfo", data}, response => {
                                    restartButton.click();
                                    console.log(`В этой игре было угадано: ${counter} фильмов`);
                                    counter = 0;
                                    play();
                                });
                            }

                            const continueButton = document.querySelector(".modal-wrong-answer__button");

                            if (title && continueButton) {
                                const result = title.innerText.match(/«(.*?)»/g);
                                if (result.length) {
                                    const filmName = result[0].slice(1, result[0].length - 1);
                                    data.correctAnswer = filmName;
                                    chrome.runtime.sendMessage({type: "addQuestionInfo", data}, response => {
                                        continueButton.click();
                                        play();
                                    });
                                }
                            }

                            if (!title && (!restartButton || !continueButton)) {
                                data.correctAnswer = data.answers[id];
                                chrome.runtime.sendMessage({type: "addQuestionInfo", data}, response => {
                                    counter++;
                                    play();
                                });
                            }
                        }, time * 1000);
                    }
                });
            }
        }, time * 1000);
    }
}

async function waitForSeconds(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(0), sec * 1000);
    });
}


function getInfo(img, answers) {
    const texts = Array.from(answers).map(e => e.innerText);
    return { imagePath: img.src, answers: texts}
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }