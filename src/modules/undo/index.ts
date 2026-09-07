import { getGuesses, removeLastGuess } from "../../shared/poople";

const BUTTON_ID = "poople-plus-undo";

function undo(): void {
  if (removeLastGuess()) {
    window.location.reload();
  }
}

function canUndo(): boolean {
  const guesses = getGuesses();
  return guesses.length > 1 && guesses.at(-1)?.toLowerCase() !== "poop";
}

function getLatestAcceptedRow(): HTMLElement | null {
  const rows = document.querySelectorAll<HTMLElement>(
    "#ScrollContainer .Row:not(#currentWordRow)",
  );
  return rows.item(rows.length - 1);
}

function handleShortcut(event: KeyboardEvent): void {
  const isUndo =
    event.key.toLowerCase() === "z" &&
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey;

  if (!isUndo || !canUndo()) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  undo();
}

export function enableUndo(): () => void {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "Undo";
  button.hidden = true;
  button.addEventListener("click", undo);
  document.body.append(button);

  let frame = 0;
  let hideTimer = 0;
  let isRevealed = false;

  function update(): void {
    frame = 0;
    const row = getLatestAcceptedRow();
    if (!canUndo() || !row) {
      isRevealed = false;
      button.hidden = true;
      return;
    }

    if (!isRevealed) {
      button.hidden = true;
      return;
    }

    button.hidden = false;
    button.style.visibility = "hidden";

    const rowRect = row.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const gap = 6;
    const edgeInset = 8;
    const direction = getComputedStyle(document.documentElement).direction;
    const trailingSpace =
      direction === "rtl"
        ? rowRect.left
        : window.innerWidth - rowRect.right;
    const useTrailingSide = trailingSpace >= buttonRect.width + gap + edgeInset;
    const preferredLeft =
      direction === "rtl"
        ? useTrailingSide
          ? rowRect.left - buttonRect.width - gap
          : rowRect.right + gap
        : useTrailingSide
          ? rowRect.right + gap
          : rowRect.left - buttonRect.width - gap;
    const maximumLeft = window.innerWidth - buttonRect.width - edgeInset;

    button.style.left = `${Math.min(Math.max(edgeInset, preferredLeft), maximumLeft)}px`;
    button.style.top = `${rowRect.top + rowRect.height / 2}px`;
    button.style.visibility = "visible";
  }

  function scheduleUpdate(): void {
    if (frame === 0) {
      frame = requestAnimationFrame(update);
    }
  }

  function isUndoTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
      return false;
    }

    const row = getLatestAcceptedRow();
    return button.contains(target) || Boolean(row?.contains(target));
  }

  function handlePointerOver(event: PointerEvent): void {
    if (!isUndoTarget(event.target)) {
      return;
    }

    window.clearTimeout(hideTimer);
    isRevealed = true;
    scheduleUpdate();
  }

  function handlePointerOut(event: PointerEvent): void {
    if (
      !isUndoTarget(event.target) ||
      isUndoTarget(event.relatedTarget)
    ) {
      return;
    }

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      isRevealed = false;
      button.hidden = true;
    }, 120);
  }

  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("keydown", handleShortcut, true);
  document.addEventListener("pointerover", handlePointerOver, true);
  document.addEventListener("pointerout", handlePointerOut, true);
  document.addEventListener("scroll", scheduleUpdate, true);
  window.addEventListener("resize", scheduleUpdate);
  scheduleUpdate();

  return () => {
    observer.disconnect();
    document.removeEventListener("keydown", handleShortcut, true);
    document.removeEventListener("pointerover", handlePointerOver, true);
    document.removeEventListener("pointerout", handlePointerOut, true);
    document.removeEventListener("scroll", scheduleUpdate, true);
    window.removeEventListener("resize", scheduleUpdate);
    button.removeEventListener("click", undo);
    button.remove();
    window.clearTimeout(hideTimer);
    cancelAnimationFrame(frame);
  };
}
