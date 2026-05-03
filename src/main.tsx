import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@ui/App';
import './index.css';
import { PersistenceService } from '@core/services/persistence/PersistenceService';

// Initialize persistence layer
const persistence = PersistenceService.getInstance();
persistence.init();

// Load saved state (async)
persistence.loadPersistedState();

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
} else {
    console.error('Failed to find root element');
}
