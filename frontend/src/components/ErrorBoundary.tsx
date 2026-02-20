import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="min-h-screen flex items-center justify-center bg-background px-6">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-6">🍪</div>
                        <h1 className="text-3xl font-black text-primary font-serif mb-4">Oops! Something crumbled.</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">We encountered an unexpected error. Don't worry, our chefs are already looking into it.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-accent transition-all hover:scale-105 active:scale-95"
                            >
                                Reload Page
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-white text-primary border border-primary/10 px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:bg-neutral-50 transition-all"
                            >
                                Return Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-12 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-48 text-xs font-mono text-red-800 border border-red-100">
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
