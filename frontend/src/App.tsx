import { AppShell } from './components/layout/AppShell';
import { TodoPage } from './pages/TodoPage';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell isDark={isDark} onToggleTheme={toggleTheme}>
      <TodoPage />
    </AppShell>
  );
}
