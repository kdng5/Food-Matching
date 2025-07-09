import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {setTimeLimit} from "../Mechanics/scoring";
import {DragControls} from "three/addons/controls/DragControls";
import {foodClones} from "../Food/food-spawner";
import {checkBoundary, checkFoodMergeInteraction} from "../Food/food-interaction";
import {startGame} from "../main";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {AfterimagePass, UnrealBloomPass} from "three/addons";
import {setupSandbox} from "../Mechanics/sandbox";
import {setupFoodCrisis} from "../Mechanics/food-crisis";

export let scene, camera, renderer;
export let ambientLight, spotLight;
export let postProcessing, urBloom, afterImage;
export let orbitControls, dragControls, selectedObject;

export function setupScene()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xebebeb);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0, 0, 1.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    setupMenu();
    setupOrbitControls();
    setupDragControls();
    setupUI();
    setupLighting();
    setupPostProcessing();
    window.addEventListener('resize', resize);
}

function setupLighting()
{
    ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    spotLight = new THREE.SpotLight(0xffe175, 15, 1.2, Math.PI/4);
    spotLight.position.set( 0, 2, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    scene.add(ambientLight, spotLight);
}

function setupOrbitControls()
{
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enablePan = false;
    orbitControls.minPolarAngle = Math.PI / 2.1;
    orbitControls.maxPolarAngle = Math.PI / 2.1;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 5;
    orbitControls.target.set(0, 1, 0);

    window.addEventListener('keydown', (event) =>
    {
        if(event.code === 'Space')
        {
            event.stopImmediatePropagation();
            event.preventDefault();
            switchModeIndicator();
        }
    });
}

function setupDragControls()
{
    dragControls = new DragControls(foodClones, camera, renderer.domElement);
    dragControls.enabled = false;
    dragControls.addEventListener('dragstart', (evt) => selectedObject = evt.object);
    dragControls.addEventListener('drag', () =>
    {
        checkFoodMergeInteraction();
        checkBoundary();
    });
    dragControls.addEventListener('dragend', () => clearSelectedObject());
}

function setupUI()
{
    const closeBtn = document.querySelector('.error__close');
    const errorBox = document.querySelector('.error');
    closeBtn.addEventListener('click', () =>
        errorBox.style.display = 'none');

    const modeIndicator = document.getElementById("indicator");
    modeIndicator.onclick = () => switchModeIndicator();
}

function setupMenu()
{
    //#region Gamemode selection
    const gamemodes = document.getElementById("gamemodes");
    const timeOptions = document.getElementById("time");
    let gamemode, setupGamemode;
    const timeSelections = document.querySelectorAll('input[name="time-radio"]');

    gamemodes.addEventListener("change", () =>
    {
        gamemode = document.querySelector('input[name="gamemode-radio"]:checked').value;
        switch(gamemode)
        {
            case "sandbox": setupGamemode = setupSandbox; disableTimeSelections(false); break;
            case "food-crisis": setupGamemode = setupFoodCrisis; disableTimeSelections(true); break;
            default: disableTimeSelections(false); break;
        }
    })

    function disableTimeSelections(disable)
    {
        timeSelections.forEach((selection) =>
        {
            selection.disabled = disable;
        });
        timeOptions.style.opacity = disable ? 0.1 : 1;
    }
    //#endregion

    //#region Play Button
    const playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', (evt) =>
    {
        evt.stopImmediatePropagation();
        if(gamemode !== "food-crisis")
            setTimeLimit(document.querySelector('input[name="time-radio"]:checked').value);
        if(setupGamemode) setupGamemode();
        startGame()
    });
    //#endregion
}

function setupPostProcessing()
{
    postProcessing = new EffectComposer(renderer);
    const renderPass = new RenderPass( scene, camera );
    urBloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1,0, 1
    );
    afterImage = new AfterimagePass();
    afterImage.enabled = false;
    const outputPass = new OutputPass();
    postProcessing.passes = [renderPass, urBloom, afterImage, outputPass];
}

export function closeMenu()
{
    const menu = document.querySelector('.menu');
    menu.style.display = 'none';
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width,height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.render(scene,camera);
}

function switchModeIndicator()
{
    const indicator = document.getElementById('indicator');
    const modeLabel = document.getElementById('mode-label');

    orbitControls.enabled = !orbitControls.enabled;
    dragControls.enabled = !dragControls.enabled;
    if(!orbitControls.enabled)
    {
        modeLabel.textContent = 'MERGE';
        indicator.classList.add('switch-animation');
    }
    else
    {
        modeLabel.textContent = 'O R B I T';
        indicator.classList.remove('switch-animation');
    }
}

export function clearSelectedObject()
{
    selectedObject = null;
}