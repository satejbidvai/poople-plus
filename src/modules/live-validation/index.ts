import { dictionaryWords } from "../../data/dictionary";
import {
  differsByOneLetter,
  getCurrentWord,
  getGuesses,
} from "../../shared/poople";

type ValidationState = "valid" | "illegal-step" | "unknown";

const dictionary = new Set(
  dictionaryWords
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length === 4),
);

function getValidationState(): ValidationState | null {
  const currentWord = getCurrentWord();
  if (dictionary.size === 0 || currentWord.length !== 4) {
    return null;
  }

  if (!dictionary.has(currentWord)) {
    return "unknown";
  }

  const previousWord = getGuesses().at(-1)?.toLowerCase();
  return previousWord && differsByOneLetter(currentWord, previousWord)
    ? "valid"
    : "illegal-step";
}

function updateValidation(): void {
  const row = document.querySelector<HTMLElement>("#currentWordRow");
  if (!row) {
    return;
  }

  const state = getValidationState();
  if (state) {
    row.dataset.pooplePlusValidation = state;
  } else {
    delete row.dataset.pooplePlusValidation;
  }
}

function blockInvalidEnter(event: KeyboardEvent): void {
  if (event.key !== "Enter" || getValidationState() === "valid") {
    return;
  }

  if (getCurrentWord().length !== 4 || dictionary.size === 0) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
}

export function enableLiveValidation(): () => void {
  const observer = new MutationObserver(updateValidation);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  document.addEventListener("keydown", blockInvalidEnter, true);
  updateValidation();

  return () => {
    observer.disconnect();
    document.removeEventListener("keydown", blockInvalidEnter, true);
    document
      .querySelector<HTMLElement>("#currentWordRow")
      ?.removeAttribute("data-poople-plus-validation");
  };
}
