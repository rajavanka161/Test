import { AppShell } from './components/layout/AppShell';
import { useTheme } from './hooks/useTheme';
import { TodoPage } from './pages/TodoPage';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell isDark={isDark} onToggleTheme={toggleTheme}>
      <TodoPage />
    </AppShell>
  );
}
