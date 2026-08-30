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

// Quick lookup of a card's styling class by symbol (symbols are unique).
const CARD_CLASS = {};
PILES.forEach((pile) => pile.cards.forEach((c) => (CARD_CLASS[c.symbol] = pile.cls)));

const PRESETS = [
  { word: "boat", sounds: [["b", "bore"], ["oh", "poor"], ["t", "tin"]] },
  { word: "cake", sounds: [["k", "cost"], ["ay", "play"], ["k", "cost"]] },
  { word: "time", sounds: [["t", "tin"], ["eye", "pyre"], ["m", "may"]] },
  { word: "sheep", sounds: [["sh", "shire"], ["ee", "peace"], ["p", "pen"]] },
];

/* ---------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------- */
const state = {
  original: PRESETS[0].sounds.map(([symbol, example]) => ({ symbol, example })),
  sandbox: PRESETS[0].sounds.map(([symbol, example]) => ({ symbol, example })),
  selected: null, // { row, index } of the currently selected slot
};

const MIN_SLOTS = 1;
const MAX_SLOTS = 8;

/* ---------------------------------------------------------------------
 * Rendering
 * ------------------------------------------------------------------- */
function cardClass(symbol) {
  return CARD_CLASS[symbol] || "";
}

function makeCardEl(cardData, { removable, draggableSource }) {
  const el = document.createElement("div");
  el.className = `card ${cardClass(cardData.symbol)}`;
  el.draggable = true;

  const symbolEl = document.createElement("div");
  symbolEl.className = "symbol";
  symbolEl.textContent = cardData.symbol;
  el.appendChild(symbolEl);

  const exampleEl = document.createElement("div");
  exampleEl.className = "example";
  exampleEl.textContent = cardData.example;
  el.appendChild(exampleEl);

  el.title = `${cardData.symbol} — as in "${cardData.example}"`;

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData("text/plain", JSON.stringify({ ...draggableSource, symbol: cardData.symbol, example: cardData.example }));
  });

  if (removable) {
    const btn = document.createElement("button");
    btn.className = "remove-btn";
    btn.type = "button";
    btn.textContent = "✕";
    btn.title = "Remove";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const { row, index } = draggableSource;
      state[row][index] = null;
      clearSelection();
      renderAll();
    });
    el.appendChild(btn);
  }

  return el;
}

function renderRow(rowKey) {
  const container = document.getElementById(`row-${rowKey}`);
  container.innerHTML = "";
  const arr = state[rowKey];

  arr.forEach((cardData, index) => {
    const slot = document.createElement("div");
    slot.className = "slot" + (cardData ? " filled" : "");
    slot.dataset.row = rowKey;
    slot.dataset.index = String(index);

    if (state.selected && state.selected.row === rowKey && state.selected.index === index) {
      slot.classList.add("selected");
    }

    if (cardData) {
      slot.appendChild(makeCardEl(cardData, { removable: true, draggableSource: { source: "slot", row: rowKey, index } }));
    } else {
      slot.textContent = "+";
    }

    slot.addEventListener("click", () => handleSlotClick(rowKey, index));

    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("drag-over");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-over");
      handleDrop(e, rowKey, index);
    });

    container.appendChild(slot);
  });

  document.getElementById(`readout-${rowKey}`).textContent = arr.length
    ? arr.map((c) => (c ? c.symbol : "_")).join(" - ")
    : "(no sounds yet)";
}

function renderPiles() {
  const list = document.getElementById("pile-list");
  if (list.childElementCount) return; // piles are static, build once
  PILES.forEach((pile) => {
    const details = document.createElement("details");
    details.className = "pile";
    details.open = true;

    const summary = document.createElement("summary");
    summary.textContent = `${pile.label} — ${pile.category}`;
    details.appendChild(summary);

    const cardsWrap = document.createElement("div");
    cardsWrap.className = "pile-cards";
    pile.cards.forEach((cardData) => {
      const cardEl = makeCardEl(cardData, { removable: false, draggableSource: { source: "pile" } });
      cardEl.classList.add("pile-card");
      cardEl.addEventListener("click", () => handlePileCardClick(cardData));
      cardsWrap.appendChild(cardEl);
    });
    details.appendChild(cardsWrap);

    list.appendChild(details);
  });
}

function renderPresets() {
  const select = document.getElementById("preset-select");
  if (select.childElementCount > 1) return;
  PRESETS.forEach((preset, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${preset.word} (${preset.sounds.map((s) => s[0]).join("-")})`;
    select.appendChild(opt);
  });
}

function renderAll() {
  renderRow("original");
  renderRow("sandbox");
}

/* ---------------------------------------------------------------------
 * Interaction: click-to-select / click-to-place (works without drag)
 * ------------------------------------------------------------------- */
function clearSelection() {
  state.selected = null;
}

function handleSlotClick(row, index) {
  const sel = state.selected;

  if (sel && (sel.row !== row || sel.index !== index)) {
    // Swap the selected slot's contents with the clicked slot.
    const tmp = state[row][index];
    state[row][index] = state[sel.row][sel.index];
    state[sel.row][sel.index] = tmp;
    clearSelection();
    renderAll();
    return;
  }

  // Toggle selection on the same slot.
  state.selected = sel && sel.row === row && sel.index === index ? null : { row, index };
  renderAll();
}

function handlePileCardClick(cardData) {
  const sel = state.selected;
  if (!sel) return; // nothing selected: dragging is the way to place this card
  state[sel.row][sel.index] = { symbol: cardData.symbol, example: cardData.example };
  clearSelection();
  renderAll();
}

/* ---------------------------------------------------------------------
 * Interaction: HTML5 drag & drop
 * ------------------------------------------------------------------- */
function handleDrop(e, targetRow, targetIndex) {
  let payload;
  try {
    payload = JSON.parse(e.dataTransfer.getData("text/plain"));
  } catch (err) {
    return;
  }
  if (!payload) return;

  if (payload.source === "pile") {
    state[targetRow][targetIndex] = { symbol: payload.symbol, example: payload.example };
  } else if (payload.source === "slot") {
    const { row: srcRow, index: srcIndex } = payload;
    if (srcRow === targetRow && srcIndex === targetIndex) return;
    const tmp = state[targetRow][targetIndex];
    state[targetRow][targetIndex] = state[srcRow][srcIndex];
    state[srcRow][srcIndex] = tmp;
  }
  clearSelection();
  renderAll();
}

function setupTrash() {
  const trash = document.getElementById("trash");
  trash.addEventListener("dragover", (e) => {
    e.preventDefault();
    trash.classList.add("drag-over");
  });
  trash.addEventListener("dragleave", () => trash.classList.remove("drag-over"));
  trash.addEventListener("drop", (e) => {
    e.preventDefault();
    trash.classList.remove("drag-over");
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch (err) {
      return;
    }
    if (payload && payload.source === "slot") {
      state[payload.row][payload.index] = null;
      clearSelection();
      renderAll();
    }
  });
}

/* ---------------------------------------------------------------------
 * Row-level controls
 * ------------------------------------------------------------------- */
function addSlot(row) {
  if (state[row].length >= MAX_SLOTS) return;
  state[row].push(null);
  renderAll();
}

function removeSlot(row) {
  if (state[row].length <= MIN_SLOTS) return;
  state[row].pop();
  if (state.selected && state.selected.row === row && state.selected.index >= state[row].length) {
    clearSelection();
  }
  renderAll();
}

function clearRow(row) {
  state[row] = state[row].map(() => null);
  clearSelection();
  renderAll();
}

function copyDown() {
  state.sandbox = state.original.map((c) => (c ? { ...c } : null));
  document.getElementById("sandbox-word-name").value = "";
  clearSelection();
  renderAll();
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
  return state[row].map((c) => (c ? c.symbol : "_")).join(" - ");
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
  state.original = preset.sounds.map(([symbol, example]) => ({ symbol, example }));
  document.getElementById("original-word-name").value = preset.word;
  copyDown();
}

document.addEventListener("DOMContentLoaded", () => {
  renderPiles();
  renderPresets();
  renderAll();
  renderLog();
  setupTrash();

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
