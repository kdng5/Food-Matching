import {stopGame} from "../main";
import {afterImage, postProcessing} from "../Setup/setup";
import {isFoodCrisis, earthSize} from "./food-crisis";

const scoreLabel = document.querySelectorAll(".information h1")[0];
export const timeLabel = document.querySelectorAll(".information h1")[1];
let score = 0;
let timeLimit = 30;
let timeLeft = 30;
let timeElapsed = 0;

export function updateTime()
{
    timeLabel.textContent = isFoodCrisis ? `Time: ${timeElapsed++}` : `Time Left: ${--timeLeft}`;
    if(timeLeft <= 0 || earthSize <= 0) stopGame();
    else if(timeLeft <= 15 || earthSize <= 0.5) afterImage.enabled = true;
}

export const scoreMap = {0: 10, 1: 25, 2: 55, 3: 125};
export function updateScore(index)
{
    score += scoreMap[index];
    scoreLabel.textContent = `Score: ${score}`;
}

export function setTimeLimit(duration)
{
    timeLimit = duration; timeLeft = timeLimit;
    timeLabel.textContent = `Time Left: ${timeLeft}`;
}

export function showGameOver()
{
    const gameOverCard = document.querySelector(".gameover-card");
    const gameResult = document.getElementById("game-result");
    const restartButton = document.querySelector(".restart-button");
    const timeFactor = isFoodCrisis ? timeElapsed : timeLimit;
    let performance = Math.round((((score / timeFactor) / 7.01) * 100) - 100);
    if(performance > 100) performance = 100;
    else if(performance < 0) performance = 0;

    gameResult.innerHTML = `You were able to earn: ${score} points<br/><br/>In: ${timeFactor} seconds<br/></br>Which means that you performed ${performance}% better than the others<br/><br/>`;
    if(performance <= 50) gameResult.innerHTML += "Meh, you could do better. Try again?";
    else if(performance <= 75) gameResult.innerHTML += "Well well, not so bad. You can do better next time";
    else if(performance <= 90) gameResult.innerHTML += "Impressive, but there are still others who are better than you at this.";
    else if(performance <= 95) gameResult.innerHTML += "Wow look at you, so lucky";
    else gameResult.innerHTML += "What kinds of bots did you use?";
    gameOverCard.style.display = "block";
    restartButton.onclick = () =>
    {
        console.log("restarting");
        location.reload();
    }
}