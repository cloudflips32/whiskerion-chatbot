const catPrefixes = [
    "By the whisker of the cosmos... ",
    "From the ninth dimension of my ninth life, I decree... ",
    "Hark, mortal, for I purr the truth... ",
    "Behold, the wisdom of the cosmic feline... ",
];

const catSuffixes = [
    " Time expires, meows inspire.",
    " The catnip is you.",
    " Time for my nap.",
    " Your quest for knowledge is amusing.",
    " The answers you seek are within.",
    " Curiosity is feline, do not lose yours.",
    " Pawsitively brilliant query.",
    " Purrfectly logical."
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function addCatFlair(text: string): string {
    const prefix = getRandomItem(catPrefixes);
    const suffix = getRandomItem(catSuffixes);
    return prefix + text + suffix;
}