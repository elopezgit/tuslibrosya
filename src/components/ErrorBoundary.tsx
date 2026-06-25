import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-950 text-white p-10 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500">React Crash Detected!</h1>
          <div className="bg-black/50 p-6 rounded-xl w-full max-w-4xl overflow-auto border border-red-500/30">
            <h2 className="text-xl font-bold mb-2">{this.state.error?.toString()}</h2>
            <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
