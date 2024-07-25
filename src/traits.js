
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
    "offset":{
        "low":0.084,
        "high":0.228
    }
}


const highMountains = {
    "type":"constraint",
    "amplitude":{
        "low":0.084,
        "high":0.228
    }
}

const snowPeakMountains = {
    "type":"constraint",
    "amplitude":{
        "low":0.084,
        "high":0.228
    }
}



export default function BuildPlanetFromTraits( traits){
    // Based on the traits , the traits will create limitations on certain values and ranges,
    // will add certain shaders or features,
    // or will add entirely new ideas.

    // The idea is this. if the user types in a trait, it the trait type is constraint,
    //   based upon the given entry, the planets basePlanetParams will have its 
    //   params constrainted between a random low and high value going in order of traits
    //   layer by layer.




}
