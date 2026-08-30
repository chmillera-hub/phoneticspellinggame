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
 * State — every slot always holds a full { pileId, symbol, example }.
 * ------------------------------------------------------------------- */
const state = {
  original: PRESETS[0].symbols.map(slotFromSymbol),
  sandbox: PRESETS[0].symbols.map(slotFromSymbol),
};

const MIN_SLOTS = 1;
const MAX_SLOTS = 6;

/* ---------------------------------------------------------------------
 * Rendering
 * ------------------------------------------------------------------- */
function makeSlotCardEl(rowKey, index) {
  const slotState = state[rowKey][index];
  const pile = PILE_BY_ID[slotState.pileId];

  const card = document.createElement("div");
  card.className = "slot-card";

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
  label.textContent = `${pile.label} — ${pile.category}`;
  head.appendChild(label);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "›"; // ›
  nextBtn.title = "Next sound family";
  nextBtn.addEventListener("click", () => cyclePile(rowKey, index, 1));
  head.appendChild(nextBtn);

  card.appendChild(head);

  const rows = document.createElement("div");
  rows.className = "slot-card-rows";
  pile.cards.forEach((c) => {
    const rowEl = document.createElement("div");
    const isActive = c.symbol === slotState.symbol;
    rowEl.className = `sound-row ${pile.cls}` + (isActive ? " active" : "");
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

  document.getElementById(`readout-${rowKey}`).textContent = state[rowKey].length
    ? state[rowKey].map((c) => c.symbol).join(" - ")
    : "(no sounds yet)";
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

function addSlot(row) {
  if (state[row].length >= MAX_SLOTS) return;
  state[row].push(defaultSlot());
  renderRow(row);
}

function removeSlot(row) {
  if (state[row].length <= MIN_SLOTS) return;
  state[row].pop();
  renderRow(row);
}

function clearRow(row) {
  state[row] = state[row].map(defaultSlot);
  renderRow(row);
}

function copyDown() {
  state.sandbox = state.original.map((c) => ({ ...c }));
  document.getElementById("sandbox-word-name").value = "";
  renderRow("sandbox");
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
  localStorage.setItem(LOG_KEY, JSON.stringify(entries));
}

function readoutFor(row) {
  return state[row].map((c) => c.symbol).join(" - ");
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
  entries.push({
    originalWord: document.getElementById("original-word-name").value.trim(),
    originalSounds: readoutFor("original"),
    newWord: document.getElementById("sandbox-word-name").value.trim(),
    newSounds: readoutFor("sandbox"),
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

  document.getElementById("original-word-name").value = PRESETS[0].word;

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
