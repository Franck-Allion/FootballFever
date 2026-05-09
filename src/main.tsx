import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@ui/App';
import './index.css';
import '@core/commands/ResetGameCommand';
import { PersistenceService } from '@core/services/persistence/PersistenceService';
import { LocalizationService } from '@i18n/LocalizationService';

// Initialize services
const localization = LocalizationService.getInstance();
const persistence = PersistenceService.getInstance();

async function init() {
    try {
        await localization.init();
        persistence.init();
        await persistence.loadPersistedState();

        const rootElement = document.getElementById('root');
        if (rootElement) {
            ReactDOM.createRoot(rootElement).render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
        } else {
            console.error('Failed to find root element');
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
        const rootElement = document.getElementById('root');
        if (rootElement) {
            ReactDOM.createRoot(rootElement).render(
                <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
                    <h1>Initialization Error</h1>
                    <p>Failed to start the application. See console for details.</p>
                </div>
            );
        }
    }
}

init();
