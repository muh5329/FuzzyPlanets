import Fuse from 'fuse.js'

const constraintList = [
    { val: "snow" },
    { val: "mountains" },
    { val: "shallow" },
    { val: "oceans" },
    { val: "rock" },
    { val: "islands" },
    { val: "continents" },
    { val: "land only" },
    { val: "ozone" },
  ];


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
    atmosphere: false
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

const landOnly = {
    "type":"constraint",
    "fields" : [{
        "offset":{
        "low":0.328,
        "high":1.5
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

const ozoneLayer= {
    "type":"trait",
    "fields" : [{
        "atmosphere":true
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
    return planetParams
}

function applyConstriants(constraints,planetParams){

    for (let constraint of constraints){
        if (Object.values(constraint)[0].hasOwnProperty("value")){
            let val = Object.values(constraint)[0].value
            let key = Object.keys(constraint)[0]
            planetParams[key]["value"] = val
        } else {
            planetParams[Object.keys(constraint)[0]] = Object.values(constraint)[0]
        }
    }

    return planetParams
}

function getConstraintValueFromTrait(trait){
    let final = [];
    switch (trait) {
        case "shallow":
            final = final.concat(transformBasePlanetParamsConstraintByFields(shallowOceans.fields))
            break;
        case "mountains":
            final = final.concat(transformBasePlanetParamsConstraintByFields(highMountains.fields))
            break;
        case "snow":
            final = final.concat(transformBasePlanetParamsConstraintByFields(snowPeakMountains.fields))
            break;
        case "oceans":
            final = final.concat(transformBasePlanetParamsConstraintByFields(shallowOceans.fields))
            break;
        case "rock":
            final = final.concat(transformBasePlanetParamsConstraintByFields(rockPlanet.fields))
            break;
        case "islands":
            final = final.concat(transformBasePlanetParamsConstraintByFields(manyIslands.fields))
            break;
        case "continents":
            final = final.concat(transformBasePlanetParamsConstraintByFields(bigContinents.fields))
            break;
        case "land only":
            final = final.concat(transformBasePlanetParamsConstraintByFields(landOnly.fields))
            break;
        case "ozone":
            final = final.concat(transformBasePlanetParamsTraitsByFields(ozoneLayer.fields))
            break;
        default:
    }

    return final
}

function transformBasePlanetParamsConstraintByFields(fields){
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

function transformBasePlanetParamsTraitsByFields(fields){
    let finalFields = []
    for (const key in fields[0]) {
        if (fields[0].hasOwnProperty(key)) { 
            let finalField = {}
            finalField[key] = fields[0][key]; 
            finalFields.push(finalField);
        } 
      }
    return finalFields
}

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

