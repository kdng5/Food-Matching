import * as THREE from "three";
import {earth, foods} from '../Setup/models';
import {foodClones} from './food-spawner';
import {clearSelectedObject, dragControls, scene} from "../Setup/setup";
import {selectedObject} from "../Setup/setup";
import {updateScore} from "../Mechanics/scoring";
import {feedEarth} from "../Mechanics/food-crisis";

const foodsMap = {
    'Broccoli' : 0,
    'Pomegranate' : 1,
    'Pumpkin' : 2,
    'Walnut' : 3,
}

export function checkFoodEarthInteraction()
{
    const foodCollider = new THREE.Box3();
    const earthCollider = new THREE.Box3();
    if(earth) earthCollider.setFromObject(earth);
    foodClones.forEach(foodClone =>
    {
        foodCollider.setFromObject(foodClone);
        if(earthCollider.intersectsBox(foodCollider))
        {
            const foodIndex = foodsMap[foodClone.name];
            updateScore(foodIndex); feedEarth(foodIndex);
            scene.remove(foodClone);
            foodClones.splice(foodClones.indexOf(foodClone), 1);
        }
    });
}

export function checkFoodMergeInteraction()
{
    if(!selectedObject) return;

    const selectedObjectCollider = new THREE.Box3().setFromObject(selectedObject);
    const foodCollider = new THREE.Box3();

    for(let i = 0; i < foodClones.length; i++)
    {
        const food = foodClones[i];
        if(food === selectedObject || food.name !== selectedObject.name) continue;
        foodCollider.setFromObject(food);
        if(foodCollider.intersectsBox(selectedObjectCollider))
        {
            mergeFood(food, i);
            return;
        }
    }
}

function mergeFood(food, foodIndex)
{
    if(food === foods[foods.length - 1]) return;

    dragControls.enabled = false;
    addNewFood(foodsMap[food.name] + 1);
    removePair();
    dragControls.enabled = true;

    function addNewFood(index)
    {
        const newFood = foods[index].clone();
        newFood.position.copy(food.position);
        foodClones.push(newFood);
        scene.add(newFood);
    }

    function removePair()
    {
        scene.remove(food, selectedObject);
        foodClones.splice(foodIndex, 1);
        foodClones.splice(foodClones.indexOf(selectedObject), 1);
        clearSelectedObject();
    }
}

export const boundary = new THREE.Box3(
    new THREE.Vector3(-1, 1, -0.3),
    new THREE.Vector3(1, 3.5, 0.3)
);

export function checkBoundary()
{
    if(!selectedObject || boundary.containsPoint(selectedObject.position)) return;
    selectedObject.position.clamp(boundary.min, boundary.max);
}