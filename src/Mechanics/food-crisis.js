import {earth} from "../Setup/models";
import {scoreMap} from "./scoring";

export let isFoodCrisis = false;
export let earthSize = 1;
let originalSize;
let hungerRate = 0.00001;

export function setupFoodCrisis()
{
    originalSize = earth.scale.clone();
    isFoodCrisis = true;
}

export function updateEarth()
{
    if(!isFoodCrisis) return;
    earth.scale.copy(originalSize).multiplyScalar(Math.min(1.25, earthSize));
    earthSize -= hungerRate;
    hungerRate += 0.000005;
}

export function feedEarth(foodIndex)
{
    if(!isFoodCrisis) return;
    const fill = scoreMap[foodIndex] / 1000;
    earthSize += fill; hungerRate -= fill / 1000;
}