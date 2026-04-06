import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Loading from '@components/Loading.svelte';

describe('Loading', () => {
  test('renders loading text', () => {
    render(Loading);
    expect(screen.getByText('Loading meetings…')).toBeInTheDocument();
  });

  test('renders spinner svg', () => {
    const { container } = render(Loading);
    const svg = container.querySelector('svg.animate-spin');
    expect(svg).toBeInTheDocument();
  });
});
