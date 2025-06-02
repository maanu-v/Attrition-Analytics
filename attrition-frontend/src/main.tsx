import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/markdown.css';
import './styles/global.css';
import './styles/chat.css';
import './styles/sidebar.css';

createRoot(document.getElementById("root")!).render(<App />);
