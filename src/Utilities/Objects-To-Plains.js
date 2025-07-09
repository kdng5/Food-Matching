export function V3ToP3(v3)
{
    return {x: v3.x, y: v3.y, z: v3.z};
}

export function V3BoundToP3(minV3, maxV3)
{
    return {
        x: {min: minV3.x, max: maxV3.x},
        y: {min: minV3.y, max: maxV3.y},
        z: {min: minV3.z, max: maxV3.z}
    };
}

export function NumToP3(minValue, maxValue)
{
    return {
        x: {min: minValue, max: maxValue},
        y: {min: minValue, max: maxValue},
        z: {min: minValue, max: maxValue},
    };
}