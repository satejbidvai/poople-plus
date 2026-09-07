import { enableLiveValidation } from "./modules/live-validation";
import { enableUndo } from "./modules/undo";
import "./styles.css";

if (window.location.pathname === "/") {
  const cleanups = [enableLiveValidation(), enableUndo()];

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      cleanups.forEach((cleanup) => cleanup());
    });
  }
}
