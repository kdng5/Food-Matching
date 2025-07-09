import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {scene} from "./setup";

export let foods = [];
export let table, earth;

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);

export function setupModels()
{
    setupLoadingManager();
    setupEnvironment();
    setupFood();
}

function setupLoadingManager()
{
    const loadingSection = document.querySelector(".loading-section");
    const loadingBar = document.getElementById("loading-bar");
    const playButton = document.querySelector(".play-button");

    loadingManager.onProgress = (url, loaded, total) =>
        loadingBar.value = (loaded / total) * 100;

    loadingManager.onLoad = () =>
    {
        loadingSection.style.display = "none";
        playButton.style.display = "flex";
    }
}

function setupEnvironment()
{
    //Kitchen
    gltfLoader.load(
        `${import.meta.env.BASE_URL}Kitchen/Kitchen.glb`,
        (glb) => {
            table = glb.scene;
            scene.add(table);
        },
        undefined,
        (error) => console.log('Kitchen.glb load error:', error)
    );

    //Earth
    gltfLoader.load(
        `${import.meta.env.BASE_URL}Earth/Earth.gltf`,
        (gltf) =>
        {
            earth = gltf.scene;
            earth.position.y = 3;
            scene.add(earth);
        },
        undefined,
        (error) => console.log('Earth.gltf load error:', error)
    );
}

function setupFood()
{
    gltfLoader.setPath(`${import.meta.env.BASE_URL}Foods/`);
    const modelPaths = [
        'Broccoli/broccoli.gltf',
        'Pomegranate/pomegranate.gltf',
        'Pumpkin/pumpkin.gltf',
        'Walnut/walnut.glb'];
    const modelNames = ['Broccoli', 'Pomegranate', 'Pumpkin', 'Walnut'];

    for(let i = 0; i < modelNames.length; i++)
    {
        gltfLoader.load(modelPaths[i], (model) =>
        {
            model.scene.traverse((child) =>
            {
                if(child.isMesh)
                {
                    child.receiveShadow = true;
                    if(i > 0 && i < 3) child.scale.set(0.2, 0.2, 0.2);
                    else if(i === 3) child.scale.set(0.0001, 0.0001, 0.0001);
                    child.name = modelNames[i];
                    foods[i] = child;
                }
            });
        },
            undefined,
            (error) => console.log(`Error loading ${modelNames[i]}: `, error));
    }
}
