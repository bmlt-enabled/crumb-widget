import { describe, test, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import FilterDropdown from '@components/FilterDropdown.svelte';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' }
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FilterDropdown — closed state', () => {
  test('renders button with label', () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn() } });
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  test('does not show options when closed', () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn() } });
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });
});

describe('FilterDropdown — opening and closing', () => {
  test('clicking button opens dropdown', async () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn() } });
    await fireEvent.click(screen.getByText('Pick one'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  test('clicking button again closes dropdown', async () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn() } });
    await fireEvent.click(screen.getByText('Pick one'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    await fireEvent.click(screen.getByText('Pick one'));
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  test('calls onopen when dropdown opens', async () => {
    const onopen = vi.fn();
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn(), onopen } });
    await fireEvent.click(screen.getByText('Pick one'));
    expect(onopen).toHaveBeenCalledOnce();
  });

  test('does not call onopen when dropdown closes', async () => {
    const onopen = vi.fn();
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn(), onopen } });
    await fireEvent.click(screen.getByText('Pick one'));
    onopen.mockClear();
    await fireEvent.click(screen.getByText('Pick one'));
    expect(onopen).not.toHaveBeenCalled();
  });

  test('clicking outside closes dropdown', async () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle: vi.fn() } });
    await fireEvent.click(screen.getByText('Pick one'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    await fireEvent.click(document.body);
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });
});

describe('FilterDropdown — selection', () => {
  test('clicking an option calls onToggle with the value', async () => {
    const onToggle = vi.fn();
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: [], options, onToggle } });
    await fireEvent.click(screen.getByText('Pick one'));
    await fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(onToggle).toHaveBeenCalledWith('a');
  });

  test('selected options show checkmark and bold text', async () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: true, selected: ['a'], options, onToggle: vi.fn(), isOpen: true } });
    const alphaBtn = screen.getByRole('button', { name: 'Alpha' });
    expect(alphaBtn).toHaveClass('font-semibold');
    // Checkmark SVG inside the selected option
    expect(alphaBtn.querySelector('svg')).toBeInTheDocument();
  });

  test('unselected options do not show checkmark', async () => {
    render(FilterDropdown, { props: { buttonLabel: 'Pick one', isActive: false, selected: ['a'], options, onToggle: vi.fn(), isOpen: true } });
    const betaBtn = screen.getByRole('button', { name: 'Beta' });
    expect(betaBtn).not.toHaveClass('font-semibold');
    expect(betaBtn.querySelector('svg')).not.toBeInTheDocument();
  });
});

describe('FilterDropdown — active styling', () => {
  test('active button has blue styling', () => {
    const { container } = render(FilterDropdown, { props: { buttonLabel: 'Active', isActive: true, selected: ['a'], options, onToggle: vi.fn() } });
    const btn = container.querySelector('button');
    expect(btn).toHaveClass('border-blue-500');
  });

  test('inactive button has gray styling', () => {
    const { container } = render(FilterDropdown, { props: { buttonLabel: 'Inactive', isActive: false, selected: [], options, onToggle: vi.fn() } });
    const btn = container.querySelector('button');
    expect(btn).toHaveClass('border-gray-300');
  });
});
