import React from 'react';
import { Chip } from '@mui/material';
import type { Issue } from '../../types/Issue';

interface TitleCellProps {
  value: string;
  row: Issue;
  onSelect: (issue: Issue) => void;
}

const TitleCell: React.FC<TitleCellProps> = ({ value, row, onSelect }) => (
  <Chip
    label={value}
    onClick={() => onSelect(row)}
    sx={{ cursor: 'pointer' }}
  />
);

export default TitleCell; 