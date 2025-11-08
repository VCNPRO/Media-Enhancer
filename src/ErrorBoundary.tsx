import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error en la aplicación</h1>
            <p className="text-gray-300 mb-4">
              Ha ocurrido un error. Por favor, recarga la página.
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-red-400 hover:text-red-300">
                Detalles técnicos
              </summary>
              <pre className="mt-2 text-xs bg-gray-800 p-4 rounded overflow-auto">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
