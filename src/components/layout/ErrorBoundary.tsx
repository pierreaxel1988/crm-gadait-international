
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary a capturé une erreur :", error);
    console.error("Informations sur l'erreur :", errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      console.log("Affichage du fallback pour l'erreur :", this.state.error?.message);
      return this.props.fallback;
    }

    return this.props.children;
  }
}
