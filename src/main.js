import * as THREE from 'three';
import {renderer, orbitControls, setupScene, closeMenu, postProcessing} from './Setup/setup.js';
import {earth, setupModels} from "./Setup/models";
import {floatFood, spawnFood} from "./Food/food-spawner";
import {checkFoodEarthInteraction} from "./Food/food-interaction";
import {showGameOver, updateTime} from "./Mechanics/scoring";
import {updateEarth} from "./Mechanics/food-crisis";

let spawnFoodInterval, updateTimeInterval, earthInterval;

document.addEventListener('DOMContentLoaded', (evt) =>
{
    evt.stopImmediatePropagation();
    setupScene();
    setupModels();
});

function animate()
{
    orbitControls.update();
    if(earth)
        earth.applyMatrix4(new THREE.Matrix4().makeRotationY(0.001));
    floatFood();
    checkFoodEarthInteraction();
    postProcessing.render();
}

let gameStarted = false;
export function startGame()
{
    if(gameStarted) return;
    gameStarted = true;
    closeMenu();
    renderer.setAnimationLoop(animate);
    spawnFoodInterval = setInterval(spawnFood, 1000);
    updateTimeInterval = setInterval(updateTime, 1000);
    earthInterval = setInterval(updateEarth, 100);
}

export function stopGame()
{
    if(!gameStarted) return;
    gameStarted = false;
    showGameOver();
    renderer.setAnimationLoop(null);
    clearInterval(spawnFoodInterval);
    clearInterval(updateTimeInterval);
    clearInterval(earthInterval);
}
