import { Component, type ErrorInfo, type ReactNode } from "react";
import { APP_IDENTITY } from "../../config";
import { cx } from "../../lib/cx";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it in the tree and shows a
 * friendly retro-styled fallback instead of letting the whole app go
 * blank. Any screen (Log, Gallery, etc.) that throws will be caught here
 * and can be recovered from with a reload, rather than crashing silently.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`${APP_IDENTITY.name} crashed:`, error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback}>
          <h1 className={styles.title}>QUEST INTERRUPTED</h1>
          <p className={styles.message}>Something went wrong loading this screen. Give it another try.</p>
          <button type="button" onClick={this.handleReload} className={cx("pixel-btn-purple", styles.reloadButton)}>
            RELOAD {APP_IDENTITY.name.toUpperCase()}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
