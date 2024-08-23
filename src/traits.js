import Fuse from 'fuse.js'

const constraintList = [
    { val: "snow" },
    { val: "mountains" },
    { val: "shallow" },
    { val: "oceans" },
    { val: "rock" },
    { val: "islands" },
    { val: "continents" }
  ];
const layerOptions = ["ozone" ]
const options = {
    keys: ['val'],
    threshold: 0.5 // Adjust the threshold for fuzziness (0.0 is exact, 1.0 is very fuzzy)
  };

const fuse = new Fuse(constraintList, options);
  
const basePlanetParams = {
    radius: { value: 20.0 },
    amplitude: { value: 1.19 },
    sharpness: { value: 2.6 },
    offset: { value: -0.016 },
    period: { value: 0.6 },
    persistence: { value: 0.484 },
  }

const shallowOceans = {
    "type":"constraint",
    "fields" : [{
        "offset":{
                "low":0.084,
                "high":0.228
            }
    }],
}

const highMountains = {
    "type":"constraint",
    "fields" : [{
        "sharpness":{
            "low":1.62,
            "high":2.42
        },
        "amplitude":{
            "low":1.3,
            "high":1.5
        }
    }],
}

const snowPeakMountains = {
    "type":"constraint",
    "fields" : [{
        "amplitude":{
        "low":0.084,
        "high":0.228
    }
    }],
}

const rockPlanet = {
    "type":"constraint",
    "fields" : [{
        "amplitude":{
        "low":1.5,
        "high":1.5
    },
    "sharpness":{
        "low":5,
        "high":5
    },
    "offset":{
        "low":2,
        "high":2
    }
    }],
}

const manyIslands = {
    "type":"constraint",
    "fields" : [{
        "period":{
                "low":0.22,
                "high":0.5
            }
    }],
}

const bigContinents = {
    "type":"constraint",
    "fields" : [{
        "period":{
                "low":0.9,
                "high":2.0
            }
    }],
}




export default function BuildPlanetFromTraits( traits){
    // Based on the traits , the traits will create limitations on certain values and ranges,
    // will add certain shaders or features,
    // or will add entirely new ideas.

    // The idea is this. if the user types in a trait, it the trait type is constraint,
    //   based upon the given entry, the planets basePlanetParams will have its 
    //   params constrainted between a random low and high value going in order of traits
    //   layer by layer.

    let planetParams = structuredClone(basePlanetParams);
    let constraints = [];
    for (let trait of traits){
        const result = fuse.search(trait); 
        if (result.length > 0){
            trait = result[0].item.val;
            constraints = constraints.concat( getConstraintValueFromTrait(trait) ) ;
        }
    }
   
    planetParams = applyConstriants(constraints,planetParams)
    console.log(planetParams)
    return planetParams
}

function applyConstriants(constraints,planetParams){

    for (let constraint of constraints){
        let val = Object.values(constraint)[0].value
        let key = Object.keys(constraint)[0]
        planetParams[key]["value"] = val
    }

    return planetParams
}

function getConstraintValueFromTrait(trait){
    let final = [];
    switch (trait) {
        case "shallow":
            final = final.concat(transformBasePlanetParamsByFields(shallowOceans.fields))
            break;
        case "mountains":
            final = final.concat(transformBasePlanetParamsByFields(highMountains.fields))
            break;
        case "snow":
            final = final.concat(transformBasePlanetParamsByFields(snowPeakMountains.fields))
            break;
        case "oceans":
            final = final.concat(transformBasePlanetParamsByFields(shallowOceans.fields))
            break;
        case "rock":
            final = final.concat(transformBasePlanetParamsByFields(rockPlanet.fields))
            break;
        case "islands":
            final = final.concat(transformBasePlanetParamsByFields(manyIslands.fields))
            break;
        case "continents":
            final = final.concat(transformBasePlanetParamsByFields(bigContinents.fields))
            break;
        default:
    }

    return final
}

function transformBasePlanetParamsByFields(fields){
    let finalFields = []
    const fieldArray = Object.entries(fields[0]).map(([key, value]) => ({ key, ...value }));
    for (let field of fieldArray){
        let low = field.low
        let high = field.high
        let val = getRandomBetween(low,high) 
        let name = field.key;
        let finalField = {}
        finalField[name] = { value: parseFloat(val.toFixed(2))}
        finalFields = finalFields.concat(finalField)
    }
    return finalFields
}

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

