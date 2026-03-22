import React from 'react';
import './manna.css';

export type TileState = 'empty' | 'active' | 'correct' | 'present' | 'absent' | 'hint';

interface MannaTileProps {
  letter: string;
  state: TileState;
  flipping?: boolean;
  index?: number;
  cursor?: boolean;
  popped?: boolean;
}

export const MannaTile: React.FC<MannaTileProps> = ({
  letter,
  state,
  flipping = false,
  index = 0,
  cursor = false,
  popped = false,
}) => {
  const stateClass = `manna-tile--${state}`;
  const flipClass = flipping ? 'manna-tile--flipping' : '';
  const cursorClass = cursor && state === 'empty' ? 'manna-tile--cursor' : '';
  const poppedClass = popped ? 'manna-tile--popped' : '';

  return (
    <div
      className={`manna-tile ${stateClass} ${flipClass} ${cursorClass} ${poppedClass}`}
      style={{ '--tile-index': index } as React.CSSProperties}
      aria-label={letter || 'empty'}
    >
      {letter}
    </div>
  );
};
