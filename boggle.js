var data = [];

function onLoad() {
    $.ajax({ url: "dictionary-yawl.txt", success: parseData });
}

// Callback which feeds the one-word-per-line format into an array.
function parseData(retrievedData, textStatus, jqXHR) {
    data = retrievedData.split(/\n/);
}

// Retrieves the next character in the alphabet for the given character.
function nextChar(character)
{
    return String.fromCharCode(character.charCodeAt() + 1);
}

// Returns the subset of the dataset which matches the given prefix. Assumes sorted input.
function getSubsetMatchingPrefix(dataSet, prefix)
{
    var startIdx = _.sortedIndex(dataSet, prefix);
    var endIdx;
    var lastChar = prefix.substr(prefix.length - 1);
    if ("Z" === lastChar) {
	endIdx = dataSet.length - 1;
    } else {
	endPrefix = prefix.substring(0, prefix.length - 1) + nextChar(lastChar);
	endIdx = _.sortedIndex(dataSet, endPrefix);
    }
    return dataSet.slice(startIdx, endIdx)
}

// Gets the neighbours in the Moore neighbourhood of the given coordinates.
function getNeighbours(x, y)
{
    var results = [];
    for(var i = Math.max(x - 1, 0); i <= Math.min(x + 1, 3); ++i) {
	for(var j = Math.max(y - 1, 0); j <= Math.min(y + 1, 3); ++j) {
	    if(!(i == x && j == y)) {
		results.push([i, j]);
	    }
	}
    }
    return results;
}

// Returns a new array with the neighbours we have already seen removed.
function removeAlreadySeenNeighbours(neighbours, squaresSeen)
{
    return $.grep(neighbours, function(neighbour) { return $.grep(squaresSeen, function(a) { return arraysEqual(a, neighbour); }).length === 0; });
}

// Cribbed from stackoverflow verbatim.
function arraysEqual(a, b)
{
        return $(a).not(b).get().length === 0 && $(b).not(a).get().length === 0;
}

// Recursively get words at a given square, given the words we know about, squares we have already seen, and the prefix.
function getWords(wordList, address, squaresSeen, prefix) {
    // Base case: If no words match this prefix, exit.
    if(wordList.length === 0) {
	return wordList;
    }

    // Create new state that reflets this square.
    var neighbours = removeAlreadySeenNeighbours(getNeighbours(address[0], address[1]), squaresSeen);
    var squaresNowSeen = squaresSeen.concat([address]);
    var newPrefix = prefix + getCharAt(address);
    var newWordList = getSubsetMatchingPrefix(wordList, newPrefix);

    // Look at all the valid neighbours, adding words found by appending their letters to the list.
    var words = _.flatten($.map(neighbours, function(neighbour) { return getWords(newWordList, neighbour, squaresNowSeen, newPrefix); }));

    // Only words of length 3 or greater can be played in Boggle.
    if(newPrefix.length >= 3) {
	words = words.concat(wordsOfLength(newWordList, newPrefix.length));
    }

    return words;
}

// Returns only words of this length.
function wordsOfLength(words, length)
{
    return $.grep(words, function(word) { return word.length === length; });
}

// Gets the character at the given address on the Boggle board.
function getCharAt(address)
{
    return $('#square' + address[0] + '' + address[1])[0].value;
}

// Solves the Boggle board given, returning an array of words.
function solve()
{
    var result = [];
    for(var x = 0; x <= 3; ++x) {
	for(var y = 0; y <= 3; ++y) {
	    result.push(getWords(data, [x, y], [], ""));
	}
    }

    result = _.flatten(result);

    return _.uniq(result);
}