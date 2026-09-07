const GUESSES_KEY = "guesses";

export function getGuesses(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(GUESSES_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((word): word is string => typeof word === "string")
      : [];
  } catch {
    return [];
  }
}

export function removeLastGuess(): boolean {
  const guesses = getGuesses();
  if (guesses.length <= 1 || guesses.at(-1)?.toLowerCase() === "poop") {
    return false;
  }

  localStorage.setItem(GUESSES_KEY, JSON.stringify(guesses.slice(0, -1)));
  return true;
}

export function getCurrentWord(): string {
  const boxes = document.querySelectorAll<HTMLElement>("#currentWordRow > .Box");
  return Array.from(boxes, (box) => box.textContent?.trim() ?? "")
    .join("")
    .toLowerCase();
}

export function differsByOneLetter(first: string, second: string): boolean {
  if (first.length !== second.length) {
    return false;
  }

  let differences = 0;
  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) {
      differences += 1;
    }
  }

  return differences === 1;
}
