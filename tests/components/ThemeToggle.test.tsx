import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ThemeProvider } from '@/context/ThemeProvider';

function setup() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('renders a switch with an accessible name', () => {
    setup();
    expect(
      screen.getByRole('switch', { name: /테마/ }),
    ).toBeInTheDocument();
  });

  it('reflects the current theme (light by default)', () => {
    setup();
    expect(screen.getByRole('switch')).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByText('라이트 모드')).toBeInTheDocument();
  });

  it('toggles the theme when clicked', async () => {
    setup();
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('다크 모드')).toBeInTheDocument();
  });
});
