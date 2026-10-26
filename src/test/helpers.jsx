import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { AppProvider } from '../store/AppContext.jsx';

// as: 'U01' (оюутан) | 'U99' (админ) | null (зочин)
export function renderApp(route = '/', as = 'U01') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider initialUserId={as}>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );
}
