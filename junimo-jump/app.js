//------------------------------***JUNIMO JUMP***---------------------------
//                            developed by Alli Moss
//                     General Assembly SEI Immersive Cohort 8-02

//--------------------------------DEV'S NOTES----------------------------
//Stardew Valley copyright 2016-2021 ConcernedApe LLC. Game concept and art by Eric Barrone.

//Please see Footnotes at end for sources/references of certain code blocks. Code blocks with a footnote are denoted like this:
//*number

//----------------------------GLOBAL GOODIES-----------------------------

//Starting difficulty of the game, delay for animation to run, and required number of rounds the player must get through to win. All of these are determined by the game mode chosen.
let playerLevel = 0;
let animationDelay = (playerLevel * 500) + 1500;
let winCondition = 0;
//Arrays for the possible colors the player will be shown, the randomly generated color sequence, and player's echo sequence. Empty object to hold the player's choice of game mode. 
const junimoColors = ['red', 'yellow', 'blue', 'purple', 'green']
let colorSequence = []
let echoSequence = []
let playerModeChoice = {}
//Things that we will need later for DOM manipulation
const allJunimos = document.getElementsByClassName('junimo')
const difficultyDivs = document.getElementsByClassName('difficulty-junimo')
const gameplayContainer = document.getElementById('gameplay')
gameplayContainer.style.display = 'none';
const resetButton = document.getElementById('reset-button')
const instruction = document.getElementById('instruction')
const scoreBox = document.getElementById('score-box')
const scoreDiv = document.getElementById('score-div')
const timerBox = document.getElementById('timer-box')
const difficultyContainer = document.getElementById('difficulty-selection')
const difficultyDescriptions = document.getElementsByClassName('diff-description')
const rulesBox = document.getElementById('rules')
const rulesDescription = document.getElementById('rules-description')
const vertContainers = document.getElementsByClassName('container-vert')
const hiddenContainers = document.getElementsByClassName('hidden')
const hiddenBottom = document.getElementById('bottom')
//Game difficulty modes the player can choose from
const gameModeOptions = [
    { id: 'green-diff', mode: 'easy', playerLevel: 1, winCondition: 4 },
    { id: 'yellow-diff', mode: 'medium', playerLevel: 3, winCondition: 6 },
    { id: 'red-diff', mode: 'hard', playerLevel: 5, winCondition: 8 },
    { id: 'purple-diff', mode: 'prairieking', playerLevel: 1, winCondition: Infinity }
]

//----------------------GLOBAL UTILITIES--------------------------------

//Allow for change of certain display settings and effects based on screen size for best player experience. 
//*4
//Updated by a media query later. 
let screenSize = ""
let mediaQuery = window.matchMedia("(min-width:475px) and (min-height: 800px)")
const askIfLargeScreen = (mediaQuery) => {
    if (mediaQuery.matches === true) {
        screenSize = "large"
    } else {
        screenSize = "small"
    }
}
//Streamline the process of flashing up a new instruction or feedback message for the player. 
const newInstruction = (message, outcome) => {
    instruction.innerHTML = "";
    const newH2 = document.createElement('h2')
    newH2.innerText = message;
    newH2.setAttribute('class', 'instruction')
    instruction.append(newH2)
    if (outcome) {
        const outcomeDiv = document.createElement('div');
        outcomeDiv.setAttribute('class', 'outcome')
        if (outcome === 'win') {
            outcomeDiv.setAttribute('id', 'win')
        }
        if (outcome === 'lose') {
            outcomeDiv.setAttribute('id', 'lose')
        }
        if (outcome === 'prairie') {
            outcomeDiv.setAttribute('id', 'prairie-king-lose')
        }
        instruction.append(outcomeDiv)
    }
}

//*2
//This function compares one array to another and determines whether all items in the first are equal to all items in the second. It accomplishes this with a counter variable that increments by one for each identical item found when iterating through both arrays, then comparing the value of the counter variable to the length of the echo sequence. This is necessary because, as i found out, just checking whether array1 === array2 does not actually work. This function is used as both a correctness checker for the echo sequence and an are-they-all-the-same checker for the color sequence.  
const compareSequences = (array1, array2) => {
    let counter = 0;
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] === array2[i]) {
            counter++
        }
    }
    if (counter === array1.length) {
        return 0;
    } else {
        return 1;
    }
}

//*3 (Footnote is for animateJunimos only--junimoBounce is my own work.)
//Use setTimeout to make each junimo bounce up 500 miliseconds after the previous one, allowing them to bounce one at a time rather than all at once.
const animateJunimos = (junimoSequence, delay = 500) => {
    junimoSequence.forEach((junimoDiv, i) => {
        (setTimeout(() => {
            //Make a given junimo div bounce up, then back down to baseline after 200 miliseconds. Used in animation sequence.
            const junimoBounce = (junimoDiv) => {
                junimoDiv.style.transform = 'translateY(-70px)'
                junimoDiv.style.transition = '0.3s ease-in;'
                setTimeout(() => {
                    junimoDiv.style.transform = 'translateY(0px)'
                    junimoDiv.style.transition = '0.3s ease-in;'
                }, 200)
            }
            junimoBounce(junimoDiv)
        }, i * delay))
    })
}

//                          ROUND TIMER UTILITY

//Create a timer that will run on each player turn and be displayed on the screen. If the player runs out of time before they have given a sequence of the correct length, they lose. 

//*4
let timeoutID;
let intervalID;
let playerTimer = 5000;
const turnTimer = () => {
    timerBox.innerText = (playerTimer / 1000)
    intervalID = setInterval(() => {
        playerTimer -= 1000
        timerBox.innerText = (playerTimer / 1000)
    }, 1000)
}

const turnTimeLimit = () => {
    turnTimer()
    timerBox.style.display = 'flex'
    timeoutID = setTimeout(() => {
        clearInterval(intervalID)
        for (let junimo of allJunimos) {
            junimo.style.display = 'none'
        }
        timerBox.style.display = 'none'
        playerTimer = 5000;
        if (playerModeChoice.id === 'purple-diff') {
            newInstruction(`You made it through ${playerLevel - 1} rounds of Prairie King Mode, pardner! Click Reset to play again.`, 'prairie')
        } else {
            newInstruction('Oh no, you ran out of time! Click Reset to try again.', 'lose')
        }

    }, 5000)
}

//----------------------------------LANDING VIEW--------------------------------

//                                  RULES BOX
rulesBox.addEventListener('mouseenter', (e) => {
    const junimo = e.currentTarget
    askIfLargeScreen(mediaQuery)
    if (screenSize === "large") {
        rulesDescription.style.display = 'flex'
        junimo.style.transform = 'translateY(-30px)'
        junimo.style.transition = '1s ease-in;'
    }
})

rulesBox.addEventListener('mouseleave', (e) => {
    const junimo = e.currentTarget
    askIfLargeScreen(mediaQuery)
    if (screenSize === "large") {
        rulesDescription.style.display = 'none'
        junimo.style.transform = 'translateY(0px)'
        junimo.style.transition = '1s ease-in;'
    }
})

rulesBox.addEventListener('click', (e) => {
    const junimo = e.currentTarget
    askIfLargeScreen(mediaQuery)
    if (screenSize === "small") {
        rulesDescription.style.display = 'flex'
        junimo.style.display = 'none'
    }
})

//                              GAME MODE CHOICE JUNIMOS
for (let div of difficultyDivs) {
    let description;
    if (div.innerText === 'pk') {
        description = difficultyDescriptions.namedItem('prairie')
    } else {
        description = difficultyDescriptions.namedItem(div.innerText)
    }

    //Make the junimos bounce up slightly on mouseover on large screens. Causes problems and poor player experience on small screens.
    const junimoHoverEffectUp = (e) => {
        const junimo = e.currentTarget
        askIfLargeScreen(mediaQuery)
        if (screenSize === "large") {
            description.style.display = 'flex'
            junimo.style.transform = 'translateY(-20px)'
            junimo.style.transition = '1s ease-in;'
        }
    }
    const junimoHoverEffectDown = (e) => {
        const junimo = e.currentTarget
        askIfLargeScreen(mediaQuery)
        if (screenSize === "large") {
            description.style.display = 'none'
            junimo.style.transform = 'translateY(0px)'
            junimo.style.transition = '1s ease-out;'
        }
    }

    //Pull the player's game mode selection from the div they clicked and start the game with the corresponding game mode values. Hide the landing view and unhides the gameplay view.
    div.addEventListener('click', (e) => {
        const colorId = e.currentTarget.id
        const gameModeSelection = gameModeOptions.find(element => element.id === colorId)
        const startGameMode = (gameModeSelection) => {
            playerModeChoice = gameModeSelection;
            playerLevel = gameModeSelection.playerLevel
            winCondition = gameModeSelection.winCondition
            animationDelay = (playerLevel * 500) + 1000;
            difficultyContainer.style.display = 'none';
            for (let container of hiddenContainers) {
                container.style.display = 'flex';
            }
            for (let vertContainer of vertContainers) {
                vertContainer.style.display = 'none'
            }
            for (let junimo of allJunimos) {
                junimo.style.display = 'flex'
                junimo.addEventListener('mouseenter', junimoHoverEffectUp)
                junimo.addEventListener('mouseleave', junimoHoverEffectDown)
            }
            gameplayContainer.style.display = 'flex'
            playRound(playerLevel, animationDelay)
        }
        startGameMode(gameModeSelection)
    })
    div.addEventListener('mouseenter', junimoHoverEffectUp)
    div.addEventListener('mouseleave', junimoHoverEffectDown)
}

//-------------------------GAMEPLAY FUNCTIONS---------------------------------

//                        EVERYTHING THE COMPUTER DOES
//Show the animated random color sequence, then prompt the player to respond.
const playRound = async (playerLevel, animationDelay) => {
    //Generate the random sequence of junimo colors that the player will be shown each round
    const getColorSequence = (playerLevel) => {
        for (let i = 0; i < playerLevel; i++) {
            const randIndex = Math.floor(Math.random() * junimoColors.length)
            colorSequence.push(junimoColors[randIndex])
        }
        return colorSequence;
    }

    //Show the junimo sequence to the player after a 1 second "breather" delay. I found it jarring for the user to have to go straight into the first animation from choosing their game mode. 
    const showSequence = async (playerLevel) => {
        setTimeout(() => {
            getColorSequence(playerLevel)
            let junimoSequence = [];
            for (let i = 0; i < colorSequence.length; i++) {
                let color = colorSequence[i];
                junimoSequence.push(allJunimos.namedItem(color))
            }
            animateJunimos(junimoSequence)
        }, 1000)
    }

    //Initiate the player's turn once the animation has finished running.
    const playerTurn = async (animationDelay) => {
        hiddenBottom.style.display = 'none'
        setTimeout(() => {
            hiddenBottom.style.display = 'flex'
            newInstruction('Echo the sequence!')
            turnTimeLimit()
        }, animationDelay)
    }
    showSequence(playerLevel).then(playerTurn(animationDelay))
}

//                             EVERYTHING THE PLAYER DOES

//Pull the color id from a junimo div clicked by the player and add it to the echo sequence. Check if the player has at least entered the right number of items in the echo sequence. If the player has, check if the echo sequence and the color sequence are the same, and end or move the game along accordingly. 
for (let junimo of allJunimos) {
    junimo.addEventListener('click', (e) => {
        const junimoColor = e.currentTarget.id
        echoSequence.push(junimoColor)
        const checkIfCorrect = async () => {
            if (echoSequence.length === colorSequence.length) {
                clearTimeout(timeoutID)
                clearInterval(intervalID)
                timerBox.style.display = 'none'
                if (compareSequences(echoSequence, colorSequence) === 0) {
                    //Run if the player gets the pattern correct. Add a message that the player was correct, update the player's level and score, and reset everything needed for the next round.
                    const correct = () => {
                        newInstruction('Correct!')
                        //Update the user's level, which corresponds to the difficulty of each round, and add a new "point" for the user to see in the form of a stardrop.
                        const updateScore = () => {
                            playerLevel++
                            animationDelay = (playerLevel * 500) + 1500;
                            const newStardrop = document.createElement('div')
                            newStardrop.classList.add('stardrop')
                            scoreBox.append(newStardrop)
                        }
                        updateScore();
                        //Check if the player has won the game. If they have, congratulate them, show them a cute animation of randomly bouncing junimos (and temporarily hide the reset button to avoid a bug), and encourage them to reset and play again. If they haven't won the game, initiate the next round. 
                        const checkForWinCondition = async () => {
                            if (playerLevel === winCondition) {
                                clearInterval(intervalID)
                                clearTimeout(timeoutID)
                                timerBox.style.display = 'none'
                                resetButton.style.display = 'none'
                                scoreDiv.style.display = 'none'
                                newInstruction('Congratulations, you won!', 'win')
                                let celebrationColorSequence = []
                                let celebrationJunimoSequence = []
                                for (let i = 0; i < 30; i++) {
                                    const randIndex = Math.floor(Math.random() * junimoColors.length)
                                    celebrationColorSequence.push(junimoColors[randIndex])
                                }
                                for (let i = 0; i < 30; i++) {
                                    let color = celebrationColorSequence[i];
                                    celebrationJunimoSequence.push(allJunimos.namedItem(color))
                                }
                                animateJunimos(celebrationJunimoSequence, 100)
                                setTimeout(() => {
                                    for (let junimo of allJunimos) {
                                        junimo.style.display = 'none'
                                    }
                                    resetButton.style.display = 'flex'
                                    scoreDiv.style.display = 'flex'
                                    newInstruction('Click the Reset button to play again.', 'win')
                                }, 3000)
                                return;
                            } else {
                                //Wait three seconds to let the player read the Correct message, then reset all values needed to play another round, and starts another round.
                                const resetForNextTurn = async () => {
                                    clearInterval(intervalID)
                                    clearTimeout(timeoutID)
                                    playerTimer = 5000
                                    timerBox.style.display = 'none'
                                    setTimeout(() => {
                                        colorSequence = []
                                        echoSequence = []
                                        instruction.innerHTML = ""
                                        playRound(playerLevel, animationDelay)
                                    }, 3000)
                                }
                                resetForNextTurn()
                            }
                        }
                        checkForWinCondition();
                    }
                    correct();
                } else if (compareSequences(echoSequence, colorSequence) === 1) {
                    scoreDiv.innerHTML = ""
                    for (let junimo of allJunimos) {
                        junimo.style.display = 'none'
                    }
                    //Run if the player gets the pattern incorrect. Remove all of the player's stardrops, add a message that the pattern was wrong, and instruct the player to click Reset to start over. 
                    if (playerModeChoice.id === 'purple-diff') {
                        newInstruction(`You made it through ${playerLevel - 1} rounds of Prairie King Mode, pardner! Click Reset to play again.`, 'prairie')
                    } else {
                        const incorrect = () => {
                            newInstruction('Oh no, you got the pattern wrong! Click Reset to play again.', 'lose')
                        }
                        incorrect()
                    }
                }
            }
        }
        checkIfCorrect();
    });
}

//---------------------RESET THE GAME TO NEUTRAL STATE AND LANDING VIEW------------
resetButton.addEventListener('click', () => {
    colorSequence = []
    echoSequence = []
    instruction.innerHTML = ""
    scoreBox.innerHTML = "";
    playerLevel = 0;
    winCondition = 0;
    animationDelay = (playerLevel * 500) + 1500
    gameplayContainer.style.display = 'none';
    difficultyContainer.style.display = 'flex'
    for (let vertContainer of vertContainers) {
        vertContainer.style.display = 'flex'
    }
    for (let container of hiddenContainers) {
        container.style.display = 'none';
    }
    timerBox.style.display = 'none'
    rulesBox.style.display = 'flex'
    rulesDescription.style.display = 'none'
    clearInterval(intervalID)
    clearTimeout(timeoutID)
    playerTimer = 5000
})

//------------------------SOURCES/FOOTNOTES--------------------------
//*1**Credit to W3Schools and MDN for teaching me how to use media queries to manipulate the DOM conditionally: https://www.w3schools.com/howto/howto_js_media_queries.asp and https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia.
///*2** My dad, who is not a Javascript guy but is a software engineer, helped me brainstorm on this array comparison issue, and we reached the solution in compareSequences collaboratively. 
//*3**This code block allows for each junimo to jump up on its own, then wait 500 ms before the next one jumps. Credit to Travis Horn, https://travishorn.com/delaying-foreach-iterations-2ebd4b29ad30 , for this solution for iterating over an array with a set delay between each item. 
//*4** Credit to MDN for teaching me how to set and clear a timeout using the returned timeoutID: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout