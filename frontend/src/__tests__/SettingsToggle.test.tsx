/**
 * SettingsToggle component tests — Phase 7
 *
 * Covers:
 * - Renders the label text
 * - Renders optional description when provided
 * - Omits description element when not provided
 * - Has role="switch" and correct aria-checked (true/false)
 * - Clicking calls onChange with the toggled value (true → false, false → true)
 * - Label htmlFor links to the toggle button id
 * - Applies CSS on/off class based on checked prop
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsToggle } from '../components/ui/SettingsToggle';

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Props {
  label?: string;
  description?: string;
  checked: boolean;
  onChange?: jest.Mock;
}

const renderToggle = ({
  label = 'Sound Effects',
  description,
  checked,
  onChange = jest.fn(),
}: Props) =>
  render(
    <SettingsToggle
      label={label}
      description={description}
      checked={checked}
      onChange={onChange}
    />
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SettingsToggle — rendering', () => {
  it('renders the label text', () => {
    renderToggle({ checked: false });
    expect(screen.getByText('Sound Effects')).toBeInTheDocument();
  });

  it('renders optional description when provided', () => {
    renderToggle({ checked: false, description: 'Play audio cues on key actions.' });
    expect(screen.getByText('Play audio cues on key actions.')).toBeInTheDocument();
  });

  it('does not render a description paragraph when description is omitted', () => {
    renderToggle({ checked: false });
    // No <p> with description content
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});

describe('SettingsToggle — accessibility', () => {
  it('has role="switch"', () => {
    renderToggle({ checked: false });
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('aria-checked is "false" when checked=false', () => {
    renderToggle({ checked: false });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('aria-checked is "true" when checked=true', () => {
    renderToggle({ checked: true });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('label htmlFor matches the toggle button id', () => {
    renderToggle({ checked: false });
    const toggle = screen.getByRole('switch');
    const label = screen.getByText('Sound Effects');
    // label's htmlFor should equal the button's id
    expect(label).toHaveAttribute('for', toggle.id);
  });
});

describe('SettingsToggle — interaction', () => {
  it('clicking the toggle calls onChange with true when currently false', () => {
    const onChange = jest.fn();
    renderToggle({ checked: false, onChange });
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clicking the toggle calls onChange with false when currently true', () => {
    const onChange = jest.fn();
    renderToggle({ checked: true, onChange });
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clicking the label also fires onChange', () => {
    const onChange = jest.fn();
    renderToggle({ checked: false, onChange });
    // Clicking the label triggers the associated button
    fireEvent.click(screen.getByText('Sound Effects'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('SettingsToggle — visual state classes', () => {
  it('applies "on" class when checked=true', () => {
    renderToggle({ checked: true });
    // With identity-obj-proxy, styles.on === 'on'
    expect(screen.getByRole('switch').className).toContain('on');
  });

  it('applies "off" class when checked=false', () => {
    renderToggle({ checked: false });
    expect(screen.getByRole('switch').className).toContain('off');
  });
});
