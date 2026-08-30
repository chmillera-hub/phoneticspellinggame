"use strict";

/* ---------------------------------------------------------------------
 * Sound data — transcribed from the phonetic spelling reference cards.
 * Each pile corresponds to one manner/voicing (or vowel) group and is
 * labeled the way the reference cards are (Consonants 1-5, Vowels 1-3).
 * ------------------------------------------------------------------- */
const PILES = [
  {
    id: "consonants-1",
    label: "Consonants 1",
    category: "Plosive – voiced",
    cls: "cat-plosive-voiced",
    type: "consonant",
    cards: [
      { symbol: "b", example: "bore" },
      { symbol: "d", example: "duel" },
      { symbol: "g", example: "gown" },
      { symbol: "w", example: "water" },
      { symbol: "qu", example: "quarter" },
    ],
  },
  {
    id: "consonants-2",
    label: "Consonants 2",
    category: "Fricative – voiced",
    cls: "cat-fricative-voiced",
    type: "consonant",
    cards: [
      { symbol: "j", example: "justice" },
      { symbol: "v", example: "vowel" },
      { symbol: "z", example: "zap" },
      { symbol: "zh", example: "garage" },
      { symbol: "TH", example: "this" },
      { symbol: "l", example: "lard" },
      { symbol: "r", example: "rarity" },
      { symbol: "yh", example: "yarn" },
    ],
  },
  {
    id: "consonants-3",
    label: "Consonants 3",
    category: "Nasal – voiced",
    cls: "cat-nasal-voiced",
    type: "consonant",
    cards: [
      { symbol: "m", example: "may" },
      { symbol: "n", example: "knot" },
      { symbol: "ng", example: "pang" },
    ],
  },
  {
    id: "consonants-4",
    label: "Consonants 4",
    category: "Plosive – airy",
    cls: "cat-plosive-airy",
    type: "consonant",
    cards: [
      { symbol: "p", example: "pen" },
      { symbol: "t", example: "tin" },
      { symbol: "k", example: "cost" },
      { symbol: "h", example: "hire" },
    ],
  },
  {
    id: "consonants-5",
    label: "Consonants 5",
    category: "Fricative – airy",
    cls: "cat-fricative-airy",
    type: "consonant",
    cards: [
      { symbol: "f", example: "fence" },
      { symbol: "th", example: "think" },
      { symbol: "s", example: "safe" },
      { symbol: "sh", example: "shire" },
      { symbol: "ch", example: "chess" },
    ],
  },
  {
    id: "vowels-1",
    label: "Vowels 1",
    category: "Open – voiced",
    cls: "cat-vowel-open",
    type: "vowel",
    cards: [
      { symbol: "ah", example: "plot" },
      { symbol: "uh", example: "pup" },
      { symbol: "aw", example: "palm" },
      { symbol: "ay", example: "play" },
      { symbol: "a", example: "path" },
    ],
  },
  {
    id: "vowels-2",
    label: "Vowels 2",
    category: "Medium – voiced",
    cls: "cat-vowel-medium",
    type: "vowel",
    cards: [
      { symbol: "eh", example: "pen" },
      { symbol: "ih", example: "pinch" },
      { symbol: "ee", example: "peace" },
      { symbol: "eye", example: "pyre" },
      { symbol: "air", example: "parrot" },
    ],
  },
  {
    id: "vowels-3",
    label: "Vowels 3",
    category: "Small – voiced",
    cls: "cat-vowel-small",
    type: "vowel",
    cards: [
      { symbol: "oh", example: "poor" },
      { symbol: "oo", example: "pool" },
      { symbol: "yew", example: "pewter" },
      { symbol: "ur", example: "purse" },
      { symbol: "ar", example: "partner" },
      { symbol: "ow", example: "power" },
    ],
  },
];

const PILE_BY_ID = {};
PILES.forEach((pile) => (PILE_BY_ID[pile.id] = pile));

// Short source codes (c1-c5, v1-v3) matching the "Consonants 1" / "Vowels 1"
// numbering, so a readout can show which family each sound came from —
// e.g. comparing "boat" (b(c1) -oh(v3) -t(c4)) to "vote" (v(c2) -oh(v3) -t(c4))
// makes it obvious the swap moved from Consonants 1 to Consonants 2.
const PILE_CODE = {};
(() => {
  let consonantCount = 0;
  let vowelCount = 0;
  PILES.forEach((pile) => {
    if (pile.type === "consonant") {
      consonantCount += 1;
      PILE_CODE[pile.id] = `c${consonantCount}`;
    } else {
      vowelCount += 1;
      PILE_CODE[pile.id] = `v${vowelCount}`;
    }
  });
})();

// Joins a token list the way the reference cards read: "b -oh -t" — no
// leading dash on the first sound, every sound after it prefixed with "-".
function joinTokens(tokens) {
  return tokens.map((t, i) => (i === 0 ? t : `-${t}`)).join(" ");
}

// Plain readout, no source labels — used wherever there's no counterpart
// word to compare against (e.g. the hand-drafting build row).
function formatPlain(cards) {
  return joinTokens(cards.map((c) => (c ? c.symbol : "_")));
}

// Diff-aware readout for a pair of words: a sound is tagged with its
// source pile code, e.g. "r(c2)", only when that pile family doesn't
// appear ANYWHERE in the other word — regardless of position or word
// length. If a family shows up somewhere in both words, every sound from
// it renders plain on both sides, even if it landed at a different index.
// This avoids the cascade you get from comparing position-by-position,
// where one word being longer/shorter shifts everything after it out of
// alignment and mislabels sounds that never actually changed family.
// e.g. "burp" (b -ur -p) -> "wart" (w -oh -r(c2) -t): only "r" is new,
// since c1, v3 and c4 are each present somewhere in "burp" too.
function formatCompared(cardsA, cardsB) {
  const familiesIn = (cards) => new Set(cards.filter(Boolean).map((c) => c.pileId));
  const familiesA = familiesIn(cardsA);
  const familiesB = familiesIn(cardsB);

  const tag = (cards, otherFamilies) =>
    cards.map((c) => {
      if (!c) return "_";
      return otherFamilies.has(c.pileId) ? c.symbol : `${c.symbol}(${PILE_CODE[c.pileId]})`;
    });

  return {
    a: joinTokens(tag(cardsA, familiesB)),
    b: joinTokens(tag(cardsB, familiesA)),
  };
}

// Keeps the Original Word and Rhyme Sandbox readouts diffed against each
// other live, so editing one immediately shows which sounds still match.
function renderReadouts() {
  const { a, b } = formatCompared(state.original, state.sandbox);
  document.getElementById("readout-original").textContent = a || "(no sounds yet)";
  document.getElementById("readout-sandbox").textContent = b || "(no sounds yet)";
}

// Look up which pile a symbol belongs to, so presets can be defined by
// symbol alone (e.g. "b") instead of repeating the pile id every time.
const SYMBOL_INDEX = {};
PILES.forEach((pile) => pile.cards.forEach((c) => (SYMBOL_INDEX[c.symbol] = { pileId: pile.id, ...c })));

function slotFromSymbol(symbol) {
  const found = SYMBOL_INDEX[symbol];
  if (!found) throw new Error(`Unknown sound symbol: ${symbol}`);
  return { pileId: found.pileId, symbol: found.symbol, example: found.example };
}

function defaultSlot() {
  const pile = PILES[0];
  return { pileId: pile.id, symbol: pile.cards[0].symbol, example: pile.cards[0].example };
}

const PRESETS = [
  { word: "boat", symbols: ["b", "oh", "t"] },
  { word: "cake", symbols: ["k", "ay", "k"] },
  { word: "time", symbols: ["t", "eye", "m"] },
  { word: "sheep", symbols: ["sh", "ee", "p"] },
];

/* ---------------------------------------------------------------------
 * Word bank for the hand randomizer — every entry uses only symbols
 * that exist in PILES above, so a hand built from one of these is
 * always solvable by construction (see generateHand()).
 * ------------------------------------------------------------------- */
const WORD_BANK = [
  { word: "boat", symbols: ["b", "oh", "t"] },
  { word: "coat", symbols: ["k", "oh", "t"] },
  { word: "goat", symbols: ["g", "oh", "t"] },
  { word: "moat", symbols: ["m", "oh", "t"] },
  { word: "note", symbols: ["n", "oh", "t"] },
  { word: "vote", symbols: ["v", "oh", "t"] },
  { word: "rope", symbols: ["r", "oh", "p"] },
  { word: "hope", symbols: ["h", "oh", "p"] },
  { word: "cake", symbols: ["k", "ay", "k"] },
  { word: "lake", symbols: ["l", "ay", "k"] },
  { word: "rake", symbols: ["r", "ay", "k"] },
  { word: "wake", symbols: ["w", "ay", "k"] },
  { word: "bake", symbols: ["b", "ay", "k"] },
  { word: "game", symbols: ["g", "ay", "m"] },
  { word: "name", symbols: ["n", "ay", "m"] },
  { word: "same", symbols: ["s", "ay", "m"] },
  { word: "fame", symbols: ["f", "ay", "m"] },
  { word: "time", symbols: ["t", "eye", "m"] },
  { word: "dime", symbols: ["d", "eye", "m"] },
  { word: "lime", symbols: ["l", "eye", "m"] },
  { word: "bike", symbols: ["b", "eye", "k"] },
  { word: "hike", symbols: ["h", "eye", "k"] },
  { word: "like", symbols: ["l", "eye", "k"] },
  { word: "pike", symbols: ["p", "eye", "k"] },
  { word: "side", symbols: ["s", "eye", "d"] },
  { word: "ride", symbols: ["r", "eye", "d"] },
  { word: "hide", symbols: ["h", "eye", "d"] },
  { word: "wide", symbols: ["w", "eye", "d"] },
  { word: "tide", symbols: ["t", "eye", "d"] },
  { word: "five", symbols: ["f", "eye", "v"] },
  { word: "hive", symbols: ["h", "eye", "v"] },
  { word: "dive", symbols: ["d", "eye", "v"] },
  { word: "wave", symbols: ["w", "ay", "v"] },
  { word: "cave", symbols: ["k", "ay", "v"] },
  { word: "save", symbols: ["s", "ay", "v"] },
  { word: "gave", symbols: ["g", "ay", "v"] },
  { word: "sheep", symbols: ["sh", "ee", "p"] },
  { word: "jeep", symbols: ["j", "ee", "p"] },
  { word: "deep", symbols: ["d", "ee", "p"] },
  { word: "keep", symbols: ["k", "ee", "p"] },
  { word: "queen", symbols: ["qu", "ee", "n"] },
  { word: "teen", symbols: ["t", "ee", "n"] },
  { word: "seen", symbols: ["s", "ee", "n"] },
  { word: "bean", symbols: ["b", "ee", "n"] },
  { word: "lean", symbols: ["l", "ee", "n"] },
  { word: "moon", symbols: ["m", "oo", "n"] },
  { word: "soon", symbols: ["s", "oo", "n"] },
  { word: "noon", symbols: ["n", "oo", "n"] },
  { word: "june", symbols: ["j", "oo", "n"] },
  { word: "tune", symbols: ["t", "yew", "n"] },
  { word: "cute", symbols: ["k", "yew", "t"] },
  { word: "mute", symbols: ["m", "yew", "t"] },
  { word: "cube", symbols: ["k", "yew", "b"] },
  { word: "purse", symbols: ["p", "ur", "s"] },
  { word: "curse", symbols: ["k", "ur", "s"] },
  { word: "nurse", symbols: ["n", "ur", "s"] },
  { word: "verse", symbols: ["v", "ur", "s"] },
  { word: "park", symbols: ["p", "ar", "k"] },
  { word: "dark", symbols: ["d", "ar", "k"] },
  { word: "bark", symbols: ["b", "ar", "k"] },
  { word: "shark", symbols: ["sh", "ar", "k"] },
  { word: "shout", symbols: ["sh", "ow", "t"] },
  { word: "south", symbols: ["s", "ow", "th"] },
  { word: "mouth", symbols: ["m", "ow", "th"] },
  { word: "couch", symbols: ["k", "ow", "ch"] },
  { word: "pouch", symbols: ["p", "ow", "ch"] },
  { word: "paint", symbols: ["p", "ay", "n", "t"] },
  { word: "faint", symbols: ["f", "ay", "n", "t"] },
  { word: "count", symbols: ["k", "ow", "n", "t"] },
  { word: "mount", symbols: ["m", "ow", "n", "t"] },
  { word: "toe", symbols: ["t", "oh"] },
  { word: "go", symbols: ["g", "oh"] },
  { word: "no", symbols: ["n", "oh"] },
  { word: "so", symbols: ["s", "oh"] },
  { word: "may", symbols: ["m", "ay"] },
  { word: "day", symbols: ["d", "ay"] },
  { word: "way", symbols: ["w", "ay"] },
  { word: "say", symbols: ["s", "ay"] },
  { word: "pay", symbols: ["p", "ay"] },
  { word: "new", symbols: ["n", "yew"] },
  { word: "few", symbols: ["f", "yew"] },
  { word: "high", symbols: ["h", "eye"] },
  { word: "my", symbols: ["m", "eye"] },
  { word: "boo", symbols: ["b", "oo"] },
  { word: "shoe", symbols: ["sh", "oo"] },
  { word: "pat", symbols: ["p", "a", "t"] },
  { word: "cat", symbols: ["k", "a", "t"] },
  { word: "hat", symbols: ["h", "a", "t"] },
  { word: "mat", symbols: ["m", "a", "t"] },
  { word: "sat", symbols: ["s", "a", "t"] },
  { word: "van", symbols: ["v", "a", "n"] },
  { word: "fan", symbols: ["f", "a", "n"] },
  { word: "man", symbols: ["m", "a", "n"] },
  { word: "pan", symbols: ["p", "a", "n"] },
  { word: "ran", symbols: ["r", "a", "n"] },
  { word: "pot", symbols: ["p", "ah", "t"] },
  { word: "hot", symbols: ["h", "ah", "t"] },
  { word: "dot", symbols: ["d", "ah", "t"] },
  { word: "got", symbols: ["g", "ah", "t"] },
  { word: "not", symbols: ["n", "ah", "t"] },
  { word: "cup", symbols: ["k", "uh", "p"] },
  { word: "pup", symbols: ["p", "uh", "p"] },
  { word: "sun", symbols: ["s", "uh", "n"] },
  { word: "run", symbols: ["r", "uh", "n"] },
  { word: "fun", symbols: ["f", "uh", "n"] },
  { word: "gun", symbols: ["g", "uh", "n"] },
  { word: "pen", symbols: ["p", "eh", "n"] },
  { word: "ten", symbols: ["t", "eh", "n"] },
  { word: "hen", symbols: ["h", "eh", "n"] },
  { word: "den", symbols: ["d", "eh", "n"] },
  { word: "pin", symbols: ["p", "ih", "n"] },
  { word: "win", symbols: ["w", "ih", "n"] },
  { word: "fin", symbols: ["f", "ih", "n"] },
  { word: "pig", symbols: ["p", "ih", "g"] },
  { word: "big", symbols: ["b", "ih", "g"] },
  { word: "wig", symbols: ["w", "ih", "g"] },
  { word: "zap", symbols: ["z", "a", "p"] },
  { word: "gang", symbols: ["g", "a", "ng"] },
  { word: "bang", symbols: ["b", "a", "ng"] },
  { word: "sang", symbols: ["s", "a", "ng"] },
  { word: "rang", symbols: ["r", "a", "ng"] },
  { word: "yarn", symbols: ["yh", "ar", "n"] },
  { word: "yard", symbols: ["yh", "ar", "d"] },
  { word: "this", symbols: ["TH", "ih", "s"] },
  { word: "that", symbols: ["TH", "a", "t"] },
  { word: "them", symbols: ["TH", "eh", "m"] },
  { word: "then", symbols: ["TH", "eh", "n"] },
  { word: "think", symbols: ["th", "ih", "ng"] },
  { word: "thin", symbols: ["th", "ih", "n"] },
  { word: "vet", symbols: ["v", "eh", "t"] },
  { word: "job", symbols: ["j", "ah", "b"] },
  { word: "jog", symbols: ["j", "ah", "g"] },
  { word: "log", symbols: ["l", "ah", "g"] },
  { word: "dog", symbols: ["d", "ah", "g"] },
  { word: "fog", symbols: ["f", "ah", "g"] },
  { word: "hog", symbols: ["h", "ah", "g"] },
  { word: "leg", symbols: ["l", "eh", "g"] },
  { word: "beg", symbols: ["b", "eh", "g"] },
  { word: "keg", symbols: ["k", "eh", "g"] },
  { word: "hall", symbols: ["h", "aw", "l"] },
  { word: "ball", symbols: ["b", "aw", "l"] },
  { word: "call", symbols: ["k", "aw", "l"] },
  { word: "wall", symbols: ["w", "aw", "l"] },
  { word: "tall", symbols: ["t", "aw", "l"] },
  { word: "chair", symbols: ["ch", "air"] },
  { word: "hair", symbols: ["h", "air"] },
  { word: "pair", symbols: ["p", "air"] },
];

const ALL_VOWEL_CARDS = [];
const ALL_CONSONANT_CARDS = [];
PILES.forEach((pile) =>
  pile.cards.forEach((c) => {
    const entry = { pileId: pile.id, symbol: c.symbol, example: c.example };
    (pile.type === "vowel" ? ALL_VOWEL_CARDS : ALL_CONSONANT_CARDS).push(entry);
  })
);

/* ---------------------------------------------------------------------
 * State — every slot always holds a full { pileId, symbol, example }.
 * ------------------------------------------------------------------- */
const state = {
  original: PRESETS[0].symbols.map(slotFromSymbol),
  sandbox: PRESETS[0].symbols.map(slotFromSymbol),
  hand: [], // { pileId, symbol, example, uid, used }
  build: [], // slot -> { pileId, symbol, example, uid } | null
  secretTarget: null,
};

const MIN_SLOTS = 1;
const MAX_SLOTS = 6;

const HAND_SIZE = 10;
const MIN_VOWELS = 3;
const MAX_VOWELS = 5;
const BUILD_MIN = 2;
const BUILD_MAX = 6;

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return uidCounter;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build a 10-card hand that is guaranteed solvable: the exact cards
 * needed to spell a secretly-chosen word from WORD_BANK are always
 * present (each as its own card instance, so a repeated sound like
 * "cake"'s two k's gets two physical cards). The rest of the hand is
 * random padding, constrained so the hand always has 3-5 vowel cards
 * out of 10 total.
 */
function generateHand() {
  const target = pickRandom(WORD_BANK);
  const requiredCards = target.symbols.map((sym) => ({ ...slotFromSymbol(sym), uid: nextUid() }));
  const requiredVowelCount = requiredCards.filter((c) => PILE_BY_ID[c.pileId].type === "vowel").length;
  const requiredConsonantCount = requiredCards.length - requiredVowelCount;

  let totalVowels;
  do {
    totalVowels = randInt(MIN_VOWELS, MAX_VOWELS);
  } while (totalVowels < requiredVowelCount || HAND_SIZE - totalVowels < requiredConsonantCount);

  const extraVowelsNeeded = totalVowels - requiredVowelCount;
  const extraConsonantsNeeded = HAND_SIZE - totalVowels - requiredConsonantCount;

  const extraVowelCards = Array.from({ length: extraVowelsNeeded }, () => ({
    ...pickRandom(ALL_VOWEL_CARDS),
    uid: nextUid(),
  }));
  const extraConsonantCards = Array.from({ length: extraConsonantsNeeded }, () => ({
    ...pickRandom(ALL_CONSONANT_CARDS),
    uid: nextUid(),
  }));

  const hand = shuffle([...requiredCards, ...extraVowelCards, ...extraConsonantCards]).map((c) => ({
    ...c,
    used: false,
  }));

  return { hand, target };
}

/* ---------------------------------------------------------------------
 * Rendering
 * ------------------------------------------------------------------- */
function makeSlotCardEl(rowKey, index) {
  const slotState = state[rowKey][index];
  const pile = PILE_BY_ID[slotState.pileId];

  const card = document.createElement("div");
  card.className = "slot-card";
  if (reorderSelect && reorderSelect.row === rowKey && reorderSelect.index === index) {
    card.classList.add("reorder-selected");
  }

  const head = document.createElement("div");
  head.className = "slot-card-head";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "‹"; // ‹
  prevBtn.title = "Previous sound family";
  prevBtn.addEventListener("click", () => cyclePile(rowKey, index, -1));
  head.appendChild(prevBtn);

  const label = document.createElement("span");
  label.className = "pile-label";
  // Short form ("c1 · Plosive – voiced") instead of the full "Consonants 1
  // — Plosive – voiced" — ties into the same pile codes the readouts use,
  // and leaves the header room to stay legible on a narrow phone screen.
  label.textContent = `${PILE_CODE[pile.id]} · ${pile.category}`;
  head.appendChild(label);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "›"; // ›
  nextBtn.title = "Next sound family";
  nextBtn.addEventListener("click", () => cyclePile(rowKey, index, 1));
  head.appendChild(nextBtn);

  // The header is the drag handle for reordering this slot within its
  // row — hold and drag it left/right to drop it in a new position.
  // Guard dragstart so a click on the </> buttons themselves never
  // gets hijacked into a drag. Native drag doesn't fire from a touch
  // gesture on phones, so the header is also tap-to-select: tap once to
  // pick it up, tap another card in the row to drop it there — the same
  // moveSlot() the drag path uses.
  head.draggable = true;
  head.title = "Drag to reorder — or tap, then tap another sound, to swap it in";
  head.addEventListener("dragstart", (e) => {
    if (e.target.closest("button")) {
      e.preventDefault();
      return;
    }
    reorderDrag = { row: rowKey, index };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "reorder-slot", row: rowKey, index }));
  });
  head.addEventListener("dragend", () => {
    reorderDrag = null;
    clearDropIndicators();
  });
  head.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    handleHeaderTap(rowKey, index);
  });

  card.appendChild(head);

  card.addEventListener("dragover", (e) => {
    if (!reorderDrag || reorderDrag.row !== rowKey) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    clearDropIndicators();
    card.classList.add("drop-target");
  });
  card.addEventListener("dragleave", () => card.classList.remove("drop-target"));
  card.addEventListener("drop", (e) => {
    if (!reorderDrag || reorderDrag.row !== rowKey) return;
    e.preventDefault();
    e.stopPropagation();
    clearDropIndicators();
    moveSlot(rowKey, reorderDrag.index, index);
    reorderDrag = null;
  });

  const rows = document.createElement("div");
  rows.className = "slot-card-rows";
  pile.cards.forEach((c) => {
    const rowEl = document.createElement("div");
    const isActive = c.symbol === slotState.symbol;
    rowEl.className = "sound-row" + (isActive ? ` active ${pile.cls}` : "");
    rowEl.addEventListener("click", () => selectSound(rowKey, index, c.symbol));

    const symbolEl = document.createElement("span");
    symbolEl.className = "symbol";
    symbolEl.textContent = c.symbol;
    rowEl.appendChild(symbolEl);

    const exampleEl = document.createElement("span");
    exampleEl.className = "example";
    exampleEl.textContent = c.example;
    rowEl.appendChild(exampleEl);

    rowEl.title = `${c.symbol} — as in "${c.example}"`;
    rows.appendChild(rowEl);
  });
  card.appendChild(rows);

  return card;
}

function renderRow(rowKey) {
  const container = document.getElementById(`row-${rowKey}`);
  container.innerHTML = "";
  state[rowKey].forEach((_, index) => container.appendChild(makeSlotCardEl(rowKey, index)));
  renderReadouts();
}

function renderPileIndex() {
  const list = document.getElementById("pile-index");
  if (list.childElementCount) return;
  PILES.forEach((pile) => {
    const li = document.createElement("li");
    li.textContent = `${pile.label} — ${pile.category} (${pile.cards.length})`;
    list.appendChild(li);
  });
}

function renderPresets() {
  const select = document.getElementById("preset-select");
  if (select.childElementCount > 1) return;
  PRESETS.forEach((preset, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${preset.word} (${preset.symbols.join("-")})`;
    select.appendChild(opt);
  });
}

function renderAll() {
  renderRow("original");
  renderRow("sandbox");
}

/* ---------------------------------------------------------------------
 * Interaction
 * ------------------------------------------------------------------- */
function selectSound(row, index, symbol) {
  state[row][index] = slotFromSymbol(symbol);
  renderRow(row);
}

function cyclePile(row, index, direction) {
  const currentPileId = state[row][index].pileId;
  const currentPos = PILES.findIndex((p) => p.id === currentPileId);
  const nextPos = (currentPos + direction + PILES.length) % PILES.length;
  const nextPile = PILES[nextPos];
  state[row][index] = { pileId: nextPile.id, symbol: nextPile.cards[0].symbol, example: nextPile.cards[0].example };
  renderRow(row);
}

/* ---------------------------------------------------------------------
 * Drag-to-reorder for slot cards within a row — hold the card's header
 * and drop it on another card (inserts before it) or on empty space
 * past the last card (moves it to the end of the row).
 * ------------------------------------------------------------------- */
let reorderDrag = null; // { row, index } of the slot currently being dragged
let reorderSelect = null; // { row, index } of the slot tap-selected for reordering (touch path)

function clearDropIndicators() {
  document.querySelectorAll(".slot-card.drop-target").forEach((el) => el.classList.remove("drop-target"));
}

// Moves the slot at fromIndex so it lands immediately before whatever is
// currently at targetIndex (targetIndex === row.length moves it to the
// very end). Dropping a card on itself is a no-op.
function moveSlot(row, fromIndex, targetIndex) {
  if (fromIndex === targetIndex || fromIndex + 1 === targetIndex) return;
  const arr = state[row];
  let insertAt = targetIndex;
  if (fromIndex < insertAt) insertAt -= 1;
  const [item] = arr.splice(fromIndex, 1);
  arr.splice(insertAt, 0, item);
  renderRow(row);
}

// Touch-friendly alternative to dragging a header: tap a card's header to
// select it, then tap another card's header in the same row to drop the
// selected one in immediately before it (tapping the same header again,
// or a card in a different row, just changes/clears the selection).
function handleHeaderTap(rowKey, index) {
  if (reorderSelect && reorderSelect.row === rowKey) {
    const fromIndex = reorderSelect.index;
    reorderSelect = null;
    if (fromIndex !== index) moveSlot(rowKey, fromIndex, index);
    renderRow(rowKey); // guarantees the selected highlight clears even on a no-op move
    return;
  }
  reorderSelect = { row: rowKey, index };
  renderRow(rowKey);
}

function setupRowReorderZones() {
  ["original", "sandbox"].forEach((rowKey) => {
    const container = document.getElementById(`row-${rowKey}`);
    container.addEventListener("dragover", (e) => {
      if (!reorderDrag || reorderDrag.row !== rowKey) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    container.addEventListener("drop", (e) => {
      if (!reorderDrag || reorderDrag.row !== rowKey) return;
      e.preventDefault();
      clearDropIndicators();
      moveSlot(rowKey, reorderDrag.index, state[rowKey].length);
      reorderDrag = null;
    });
  });
}

// A structural change to a row (length changes, a full reset, or the
// whole array being replaced) can leave a stale drag/tap-select pointing
// at an index that no longer means the same thing — clear both so the
// next interaction starts fresh.
function clearReorderState() {
  reorderDrag = null;
  reorderSelect = null;
  clearDropIndicators();
}

function addSlot(row) {
  if (state[row].length >= MAX_SLOTS) return;
  clearReorderState();
  state[row].push(defaultSlot());
  renderRow(row);
}

function removeSlot(row) {
  if (state[row].length <= MIN_SLOTS) return;
  clearReorderState();
  state[row].pop();
  renderRow(row);
}

function clearRow(row) {
  clearReorderState();
  state[row] = state[row].map(defaultSlot);
  renderRow(row);
}

function copyDown() {
  clearReorderState();
  state.sandbox = state.original.map((c) => ({ ...c }));
  document.getElementById("sandbox-word-name").value = "";
  renderRow("sandbox");
}

/* ---------------------------------------------------------------------
 * Hand randomizer: deal 10 cards, drag/click them into a build row to
 * spell a word, then lock it in as the Original Word above.
 * ------------------------------------------------------------------- */
function makeMiniCardEl(cardData, { draggable }) {
  const el = document.createElement("div");
  el.className = `mini-card ${CARD_CLASS[cardData.symbol] || ""}`;
  el.draggable = draggable;

  const symbolEl = document.createElement("div");
  symbolEl.className = "symbol";
  symbolEl.textContent = cardData.symbol;
  el.appendChild(symbolEl);

  const exampleEl = document.createElement("div");
  exampleEl.className = "example";
  exampleEl.textContent = cardData.example;
  el.appendChild(exampleEl);

  el.title = `${cardData.symbol} — as in "${cardData.example}"`;
  return el;
}

// Reuse the same category-class lookup the family cards use.
const CARD_CLASS = {};
PILES.forEach((pile) => pile.cards.forEach((c) => (CARD_CLASS[c.symbol] = pile.cls)));

function renderHand() {
  const tray = document.getElementById("hand-cards");
  tray.innerHTML = "";
  state.hand
    .filter((c) => !c.used)
    .forEach((cardData) => {
      const el = makeMiniCardEl(cardData, { draggable: true });
      el.classList.add("hand-card");
      el.addEventListener("click", () => placeInFirstEmptySlot(cardData.uid));
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({ source: "hand", uid: cardData.uid }));
      });
      tray.appendChild(el);
    });
}

function renderBuildRow() {
  const container = document.getElementById("build-slots");
  container.innerHTML = "";

  state.build.forEach((cardData, index) => {
    const slot = document.createElement("div");
    slot.className = "build-slot" + (cardData ? " filled" : "");
    slot.dataset.index = String(index);

    if (cardData) {
      const cardEl = makeMiniCardEl(cardData, { draggable: true });
      cardEl.addEventListener("click", (e) => {
        e.stopPropagation();
        returnSlotToHand(index);
      });
      cardEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({ source: "build", index }));
      });
      slot.appendChild(cardEl);
    } else {
      slot.textContent = "+";
    }

    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("drag-over");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-over");
      let payload;
      try {
        payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch (err) {
        return;
      }
      if (!payload) return;
      if (payload.source === "hand") placeCardInSlot(payload.uid, index);
      else if (payload.source === "build" && payload.index !== index) swapBuildSlots(payload.index, index);
    });

    container.appendChild(slot);
  });

  document.getElementById("readout-build").textContent = state.build.length
    ? formatPlain(state.build)
    : "(no slots)";

  const lockBtn = document.getElementById("lock-in");
  lockBtn.disabled = state.build.some((c) => !c);
}

function placeCardInSlot(uid, slotIndex) {
  const handCard = state.hand.find((c) => c.uid === uid);
  if (!handCard || handCard.used) return;

  const occupant = state.build[slotIndex];
  if (occupant) {
    const occupantInHand = state.hand.find((c) => c.uid === occupant.uid);
    if (occupantInHand) occupantInHand.used = false;
  }

  handCard.used = true;
  state.build[slotIndex] = { pileId: handCard.pileId, symbol: handCard.symbol, example: handCard.example, uid: handCard.uid };
  renderHand();
  renderBuildRow();
}

function placeInFirstEmptySlot(uid) {
  const emptyIndex = state.build.findIndex((c) => !c);
  if (emptyIndex === -1) return;
  placeCardInSlot(uid, emptyIndex);
}

function returnSlotToHand(slotIndex) {
  const card = state.build[slotIndex];
  if (!card) return;
  const handCard = state.hand.find((c) => c.uid === card.uid);
  if (handCard) handCard.used = false;
  state.build[slotIndex] = null;
  renderHand();
  renderBuildRow();
}

function swapBuildSlots(i, j) {
  const tmp = state.build[i];
  state.build[i] = state.build[j];
  state.build[j] = tmp;
  renderBuildRow();
}

function setupHandReturnZone() {
  const tray = document.getElementById("hand-cards");
  tray.addEventListener("dragover", (e) => e.preventDefault());
  tray.addEventListener("drop", (e) => {
    e.preventDefault();
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch (err) {
      return;
    }
    if (payload && payload.source === "build") returnSlotToHand(payload.index);
  });
}

function addBuildSlot() {
  if (state.build.length >= BUILD_MAX) return;
  state.build.push(null);
  renderBuildRow();
}

function removeBuildSlot() {
  if (state.build.length <= BUILD_MIN) return;
  const last = state.build.length - 1;
  if (state.build[last]) returnSlotToHand(last);
  state.build.pop();
  renderBuildRow();
}

function clearBuild() {
  state.build.forEach((_, i) => {
    if (state.build[i]) returnSlotToHand(i);
  });
}

function showLockMessage(text) {
  const el = document.getElementById("lock-message");
  el.textContent = text;
  el.hidden = false;
}

function lockInWord() {
  if (state.build.some((c) => !c)) return;
  const nameInput = document.getElementById("drafted-word-name");
  const wordName = nameInput.value.trim();
  if (!wordName) {
    showLockMessage("Type the word you spelled before locking it in.");
    return;
  }

  state.original = state.build.map((c) => ({ pileId: c.pileId, symbol: c.symbol, example: c.example }));
  document.getElementById("original-word-name").value = wordName;
  copyDown();
  renderRow("original");

  showLockMessage(
    `Locked in "${wordName}" (${formatPlain(state.build)}) — now rift on it in the Rhyme Sandbox below.`
  );

  document.getElementById("original-block").scrollIntoView({ behavior: "smooth", block: "center" });
}

function newHand() {
  const { hand, target } = generateHand();
  state.hand = hand;
  state.secretTarget = target;
  state.build = Array(target.symbols.length).fill(null);
  document.getElementById("drafted-word-name").value = "";
  document.getElementById("lock-message").hidden = true;
  renderHand();
  renderBuildRow();
}

/* ---------------------------------------------------------------------
 * Rhyme log (saved to localStorage so it survives a page reload)
 * ------------------------------------------------------------------- */
const LOG_KEY = "phonetic-rhyme-log";

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  } catch (err) {
    return [];
  }
}

function saveLog(entries) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  } catch (err) {
    // Storage unavailable (private browsing, quota, etc.) — the log just
    // won't persist across a reload; nothing else in the page depends on it.
  }
}

function renderLog() {
  const entries = loadLog();
  const list = document.getElementById("rhyme-log");
  const empty = document.getElementById("log-empty");
  list.innerHTML = "";
  empty.style.display = entries.length ? "none" : "block";

  entries.forEach((entry, i) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${entry.originalWord || "?"} (${entry.originalSounds})  →  ${entry.newWord || "?"} (${entry.newSounds})`;
    li.appendChild(text);

    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "remove";
    del.addEventListener("click", () => {
      const updated = loadLog();
      updated.splice(i, 1);
      saveLog(updated);
      renderLog();
    });
    li.appendChild(del);

    list.appendChild(li);
  });
}

function savePair() {
  const entries = loadLog();
  const { a: originalSounds, b: newSounds } = formatCompared(state.original, state.sandbox);
  entries.push({
    originalWord: document.getElementById("original-word-name").value.trim(),
    originalSounds,
    newWord: document.getElementById("sandbox-word-name").value.trim(),
    newSounds,
  });
  saveLog(entries);
  renderLog();
}

async function copyLogToClipboard() {
  const entries = loadLog();
  const text = entries
    .map((e) => `${e.originalWord || "?"} (${e.originalSounds}) -> ${e.newWord || "?"} (${e.newSounds})`)
    .join("\n");
  const btn = document.getElementById("copy-log");
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = original), 1200);
  } catch (err) {
    // Clipboard API unavailable (e.g. insecure context) — fail silently.
  }
}

/* ---------------------------------------------------------------------
 * Wire everything up
 * ------------------------------------------------------------------- */
function loadPreset(index) {
  const preset = PRESETS[index];
  if (!preset) return;
  state.original = preset.symbols.map(slotFromSymbol);
  document.getElementById("original-word-name").value = preset.word;
  copyDown();
  renderRow("original");
}

document.addEventListener("DOMContentLoaded", () => {
  renderPileIndex();
  renderPresets();
  renderAll();
  renderLog();
  setupHandReturnZone();
  setupRowReorderZones();
  newHand();

  document.getElementById("original-word-name").value = PRESETS[0].word;

  document.getElementById("new-hand").addEventListener("click", newHand);
  document.getElementById("add-build-slot").addEventListener("click", addBuildSlot);
  document.getElementById("remove-build-slot").addEventListener("click", removeBuildSlot);
  document.getElementById("clear-build").addEventListener("click", clearBuild);
  document.getElementById("lock-in").addEventListener("click", lockInWord);

  document.querySelectorAll(".add-slot").forEach((btn) =>
    btn.addEventListener("click", () => addSlot(btn.dataset.row))
  );
  document.querySelectorAll(".remove-slot").forEach((btn) =>
    btn.addEventListener("click", () => removeSlot(btn.dataset.row))
  );
  document.querySelectorAll(".clear-row").forEach((btn) =>
    btn.addEventListener("click", () => clearRow(btn.dataset.row))
  );

  document.getElementById("copy-down").addEventListener("click", copyDown);
  document.getElementById("save-pair").addEventListener("click", savePair);
  document.getElementById("copy-log").addEventListener("click", copyLogToClipboard);
  document.getElementById("clear-log").addEventListener("click", () => {
    saveLog([]);
    renderLog();
  });
  document.getElementById("preset-select").addEventListener("change", (e) => {
    if (e.target.value !== "") loadPreset(Number(e.target.value));
    e.target.value = "";
  });
});
