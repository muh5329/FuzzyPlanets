
const basePlanetParams = {
    type: { value: 2 },
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



const constraintOptions = ["snow", "mountains","shallow","oceans","rock"]
const layerOptions = ["ozone" ]

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
        if ( constraintOptions.indexOf(trait) != -1 ){
            constraints = constraints.concat( getConstraintValueFromTrait(trait) ) ;
        }  
    }
   
    planetParams = applyConstriants(constraints,planetParams)
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
        default:
    }

    return final
}

function transformBasePlanetParamsByFields(fields){
    let finalFields = []
    for (let field of fields){
        let lowHighs = Object.values(field)[0]
        let low = lowHighs.low;
        let high = lowHighs.high;
        let val = getRandomBetween(low,high) 
        let name = Object.keys(Object.values(fields)[0])[0];
        let finalField = {}
        finalField[name] = { value: parseFloat(val.toFixed(2))}
        finalFields = finalFields.concat(finalField)
    }
    return finalFields
}

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

