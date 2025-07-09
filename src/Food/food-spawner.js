import {foods} from "../Setup/models";
import {scene} from "../Setup/setup";
import {boundary} from "./food-interaction";
import * as THREE from "three";

export let foodClones = [];

export function spawnFood()
{
    const food = foods[0];
    if(!food) return;

    const foodClone = food.clone();
    foodClone.position.copy(getRandomV3());
    foodClones.push(foodClone);
    scene.add(foodClone);
}

function getRandomFloat(min, max)
{
    return Math.random() * (max - min) + min;
}

function getRandomV3()
{
    const randomX = getRandomFloat(boundary.min.x, boundary.max.x);
    const randomZ = getRandomFloat(boundary.min.z, boundary.max.z);
    return new THREE.Vector3(randomX, boundary.min.y, randomZ);
}

export function floatFood()
{
    foodClones.forEach((food) => food.position.y += 0.0002);
}