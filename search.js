const pages = [
    {
        title: "Lasagna",
        url: "recipies/lasagna.html",
        image: "images/lasagna.jpg",
        colorClass: "las",
        keywords: ["pasta", "tomato", "cheese", "layers", "beef", "garfield", "vomit", "italian"]
    },
    {
        title: "McFlat",
        url: "recipies/mcflat.html",
        image: "images/Big_Mac.png",
        colorClass: "mcflat",
        keywords: ["burger", "flat", "mcdonalds", "buns", "beef", "sandwich"]
    },
    {
        title: "Rocky Road",
        url: "recipies/rockyroad.html",
        image: "images/road-lot-rocks-dirt-front-house-very-muddy-sky-cloudy-357967386.webp",
        colorClass: "road",
        keywords: ["dessert", "chocolate", "marshmallow", "road", "rock", "rough", "construction"]
    },
    {
        title: "Gaslighter's Best Dish",
        url: "recipies/gas.html",
        image: "images/360_F_243640274_bRUJEbjJw0ei8K9vrHTMVAfKMtwNx0qO.jpg",
        colorClass: "gaslighter",
        keywords: ["empty", "nothing", "pointless", "unsatisfying", "liar", "deciever"]
    },
    {
        title: "Foo",
        url: "recipies/foo.html",
        image: "images/foo-foo-dressing-2138165-4429c80cf5274e17a38565a0298123b4.jpg",
        colorClass: "",
        keywords: ["+'bar'", "fooNan", "nan", "kungfoo", "nanjing", "fooBar"]
    },
    {
        title: "Bar",
        url: "recipies/bar.html",
        image: "images/images (1).jpg",
        colorClass: "Bar",
        keywords: ["drinks", "fooNan", "fooBar", "barmitzvah", "nan", "bartering"]
    }
];

const minScore = 0.5;
const keywordWeight = 0.8

function toWords(text) {
    const lowerText = text.toLowerCase();
    const allowedCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const words = [];
    let currentWord = "";

    for (let i = 0; i < lowerText.length; i = i + 1) {
        const character = lowerText[i];

        if (allowedCharacters.includes(character)) {
            currentWord = currentWord + character;
        } else if (character === " ") {
            if (currentWord.length > 0) {
                words.push(currentWord);
            }
            currentWord = "";
        }
    }

    if (currentWord.length > 0) {
        words.push(currentWord);
    }

    return words;
}

function editDist(a, b) {
    const grid = [];

    for (let i = 0; i <= a.length; i = i + 1) {
        const row = [];
        row[0] = i;
        grid.push(row);
    }

    for (let j = 1; j <= b.length; j = j + 1) {
        grid[0][j] = j;
    }

    for (let i = 1; i <= a.length; i = i + 1) {
        for (let j = 1; j <= b.length; j = j + 1) {
            const removeCost = grid[i - 1][j] + 1;
            const addCost = grid[i][j - 1] + 1;

            let swapCost;
            if (a[i - 1] === b[j - 1]) {
                swapCost = grid[i - 1][j - 1];
            } else {
                swapCost = grid[i - 1][j - 1] + 1;
            }

            grid[i][j] = Math.min(removeCost, addCost, swapCost);
        }
    }

    return grid[a.length][b.length];
}

function wordSim(typed, target) {
    if (typed === target) {
        return 1;
    }

    if (target.startsWith(typed)) {
        return 0.9;
    }

    if (target.includes(typed)) {
        return 0.7;
    }

    const changes = editDist(typed, target);
    const longerLength = Math.max(typed.length, target.length);
    const similarity = 1 - changes / longerLength;

    if (similarity >= 0.6) {
        return similarity;
    } else {
        return 0;
    }
}

function scorePage(query, page) {
    const typedWords = toWords(query);
    const titleWords = toWords(page.title);
    const keywordWords = toWords(page.keywords.join(" "));

    let total = 0;

    for (let t = 0; t < typedWords.length; t = t + 1) {
        const typed = typedWords[t];
        let best = 0;

        for (let w = 0; w < titleWords.length; w = w + 1) {
            const score = wordSim(typed, titleWords[w]);
            if (score > best) {
                best = score;
            }
        }

        for (let k = 0; k < keywordWords.length; k = k + 1) {
            const score = wordSim(typed, keywordWords[k]) * keywordWeight;
            if (score > best) {
                best = score;
            }
        }

        total = total + best;
    }

    return total / typedWords.length;
}


const searchBox = document.getElementById("search-box");
const resultsBox = document.getElementById("results");
const statusText = document.getElementById("search-status");

function makeCard(page) {
    const card = document.createElement("a");
    card.href = page.url;
    card.className = "result-card";

    const picture = document.createElement("img");
    picture.src = page.image;
    picture.alt = page.title;

    const heading = document.createElement("h2");
    heading.textContent = page.title;
    heading.className = page.colorClass;

    card.appendChild(picture);
    card.appendChild(heading);
    return card;
}

function compareByScore(resultA, resultB) {
    return resultB.score - resultA.score;
}

function showResults(query) {
    const typedWords = toWords(query);
    const matches = [];

    if (typedWords.length === 0) {
        for (let i = 0; i < pages.length; i = i + 1) {
            matches.push(pages[i]);
        }
        statusText.textContent = "";
    } else {
        const scoredPages = [];
        for (let i = 0; i < pages.length; i = i + 1) {
            const score = scorePage(query, pages[i]);
            if (score >= minScore) {
                scoredPages.push({ page: pages[i], score: score });
            }
        }

        scoredPages.sort(compareByScore);

        for (let i = 0; i < scoredPages.length; i = i + 1) {
            matches.push(scoredPages[i].page);
        }

        if (matches.length === 0) {
            statusText.textContent = 'Nothing matches "' + query + '". Try a food, like chocolate, or an object like rebar.';
        } else if (matches.length === 1) {
            statusText.textContent = "1 recipe found";
        } else {
            statusText.textContent = matches.length + " recipes found";
        }
    }

    resultsBox.innerHTML = "";

    for (let i = 0; i < matches.length; i = i + 1) {
        const card = makeCard(matches[i]);
        resultsBox.appendChild(card);
    }
}

function handleTyping() {
    showResults(searchBox.value);
}

searchBox.addEventListener("input", handleTyping);

showResults("");