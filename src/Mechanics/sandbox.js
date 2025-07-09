import {Pane} from 'tweakpane';
import {afterImage, ambientLight, scene, spotLight, urBloom} from "../Setup/setup";
import {earth, foods, table} from "../Setup/models";
import {boundary} from "../Food/food-interaction";
import {Box3Helper} from "three";
import {foodClones} from "../Food/food-spawner";
import * as Utils from "../Utilities/Objects-To-Plains";

let rootBoundary;
let sizePane;

export function setupSandbox()
{
    sizePane = new Pane();
    setPanePosition();
    setupEarthGUI();
    setupTableGUI();
    setupFoodGUI();
    setupLightingGUI();
}

function setPanePosition()
{
    const style = sizePane.element.style;
    style.position = "fixed";
    style.bottom = "0%"; style.left = "0%";
    style.transformOrigin = "bottom left";
    style.zIndex = "3"
    style.transform = "scale(2)";
}

function setupEarthGUI()
{
    const earthGUI = sizePane.addFolder({title: "Earth Size", expanded: false});
    const earthSize = {size: Utils.V3ToP3(earth.scale)};

    const binding = earthGUI.addBinding(earthSize, 'size', {
        x: {min: 0.1, max: 2},
        y: {min: 0.1, max: 2},
        z: {min: 0.1, max: 2}
    });
    binding.on('change', (ev) => earth.scale.set(...Object.values(ev.value)));
}

function setupTableGUI()
{
    const tableGUI = sizePane.addFolder({title: "Table", expanded: false});
    rootBoundary = boundary;

    const boundaryVisualizer = new Box3Helper(boundary, 0xff0022);
    scene.add(boundaryVisualizer);

    //#region Table Size
    const size = tableGUI.addFolder({title: "Size", expanded: false});
    const tableSize = {size: Utils.V3ToP3(table.scale)};
    const tableSizeFactor = tableSize.size.x;
    size.addBinding(tableSize, 'size', Utils.NumToP3(tableSizeFactor / 10, tableSizeFactor * 2)).on('change', (ev) =>
    {
        const prevTableScale = table.scale.clone();
        table.scale.set(...Object.values(ev.value));
        const changeVector = getChangeVector(prevTableScale);
        rootBoundary.expandByVector(changeVector);
        boundary.expandByVector(changeVector);
    });

    function getChangeVector(prevTableScale)
    {
        let changeVector = table.scale.clone().sub(prevTableScale);
        const yChange = changeVector.y / 2;
        boundary.min.y += yChange; boundary.max.y += yChange;
        rootBoundary.min.y += yChange; rootBoundary.max.y += yChange;
        changeVector.x /= 2; changeVector.y = 0; changeVector.z /= 5.2;
        return changeVector;
    }
    //#endregion

    //#region Boundary Size
    const boundaryGUI = tableGUI.addFolder({title: "Boundary", expanded: false});
    const boundarySize = {
        Minimum: Utils.V3ToP3(boundary.min),
        Maximum: Utils.V3ToP3(boundary.max),
    };
    boundaryGUI.addBinding(boundarySize, 'Minimum', Utils.V3BoundToP3(rootBoundary.min, rootBoundary.max)).on('change',
        (ev) => boundary.min.set(...Object.values(ev.value)));
    boundaryGUI.addBinding(boundarySize, 'Maximum', Utils.V3BoundToP3(rootBoundary.min, rootBoundary.max)).on('change',
        (ev) => boundary.max.set(...Object.values(ev.value)));
    //#endregion
}

function setupFoodGUI()
{
    const foodsGUI = sizePane.addFolder({title: "Foods", expanded: false});

    foods.forEach(food =>
    {
        const foodGUI = foodsGUI.addFolder({title: food.name, expanded: false});
        const foodSize = {scale: food.scale.clone().x};
        const spawnOnlyParam = {spawnOnly: false};

        foodGUI.addBinding(foodSize, 'scale', {min: foodSize.scale/10, max: foodSize.scale * 3}).on('change', (ev) =>
        {
            food.scale.setScalar(ev.value);
            if(!spawnOnlyParam.spawnOnly)
                foodClones.forEach((foodClone) =>
                {
                    if(foodClone.name === food.name)
                        foodClone.scale.setScalar(ev.value);
                });
        });
        foodGUI.addBinding(spawnOnlyParam, 'spawnOnly');
    })
}

function setupLightingGUI()
{
    const lightingPane = new Pane();

    //#region CSS Style
    const style = lightingPane.element.style;
    style.position = "fixed";
    style.bottom = "0%"; style.right = "0%";
    style.transformOrigin = "bottom right";
    style.zIndex = "3";
    style.transform = "scale(2)";
    //#endregion

    //#region Lighting
    const lightingGUI = lightingPane.addFolder({title: "Lighting", expanded: true});

    //#region Ambient Light
    const ambientGUI = lightingGUI.addFolder({title: "Ambient Light", expanded: false});
    const ambientParams = {color: ambientLight.color, intensity: ambientLight.intensity};

    ambientGUI.addBinding(ambientParams, 'color', {color: {type: 'float'}, picker: 'inline'}).on('change', (ev) => ambientLight.color.set(ev.value));
    ambientGUI.addBinding(ambientParams, 'intensity', {min: 0, max: 10}).on('change', (ev) => ambientLight.intensity = ev.value);
    //#endregion

    //#region Spotlight
    const spotlightGUI = lightingGUI.addFolder({title: "Spotlight", expanded: false});
    const spotlightParams = {
        color: spotLight.color,
        intensity: spotLight.intensity,
        distance: spotLight.distance,
        angle: spotLight.angle,
        penumbra: spotLight.penumbra,
        decay: spotLight.decay,
    };
    spotlightGUI.addBinding(spotlightParams, 'color', {color: {type: 'float'}, picker: 'inline'}).on('change',
        (ev) => spotLight.color.set(ev.value));
    spotlightGUI.addBinding(spotlightParams, 'intensity', {min: 0, max: 100}).on('change', (ev) => spotLight.intensity = ev.value);
    spotlightGUI.addBinding(spotlightParams, 'distance', {min: 0, max: 10}).on('change', (ev) => spotLight.distance = ev.value);
    spotlightGUI.addBinding(spotlightParams, 'angle', {min: -180, max: 180}).on('change', (ev) => spotLight.angle = ev.value * Math.PI / 180);
    spotlightGUI.addBinding(spotlightParams, 'penumbra', {min: 0, max: 1}).on('change', (ev) => spotLight.penumbra = ev.value);
    spotlightGUI.addBinding(spotlightParams, 'decay', {min: 0, max: 10}).on('change', (ev) => spotLight.decay = ev.value);
    //#endregion
    //#endregion

    //#region Post Processing
    const ppGUI = lightingPane.addFolder({title: "Post Processings", expanded: true});

    //#region Unreal Bloom
    const bloomGUI = ppGUI.addFolder({title: "Unreal Bloom", expanded: false});
    const bloomParams = {enabled : true, strength: urBloom.strength, radius: urBloom.radius, threshold: urBloom.threshold};

    bloomGUI.addBinding(bloomParams, 'enabled').on('change', (ev) => urBloom.enabled = ev.value);
    bloomGUI.addBinding(bloomParams, 'strength', {min: 0, max: 10}).on('change', (ev) => urBloom.strength = ev.value);
    bloomGUI.addBinding(bloomParams, 'radius', {min: 0, max: 2}).on('change', (ev) => urBloom.radius = ev.value);
    bloomGUI.addBinding(bloomParams, 'threshold', {min: 0.8, max: 1}).on('change', (ev) => urBloom.threshold = ev.value);
    //#endregion

    //#region Afterimage
    const afterimageGUI = ppGUI.addFolder({title: "Afterimage", expanded: false});
    const afterimageParams = {enabled: false, damp: 0.96};

    afterimageGUI.addBinding(afterimageParams, 'enabled').on('change', (ev) => afterImage.enabled = ev.value);
    afterimageGUI.addBinding(afterimageParams, 'damp', {min: 0, max: 1}).on('change', (ev) => afterImage.uniforms["damp"].value = ev.value);
    //#endregion
    //#endregion
}