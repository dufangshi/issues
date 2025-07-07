import React from 'react';
import { Box, Chip } from '@mui/material';

interface TagsCellProps {
  value?: string[];
}

const TagsCell: React.FC<TagsCellProps> = ({ value }) => (
  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
    {value && value.length > 0 ? (
      <>
        {value.slice(0, 2).map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            sx={{
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              fontSize: '0.75rem',
              height: 20,
            }}
          />
        ))}
        {value.length > 2 && (
          <Chip
            label={`+${value.length - 2}`}
            size="small"
            sx={{
              bgcolor: '#f5f5f5',
              color: '#666',
              fontSize: '0.75rem',
              height: 20,
            }}
          />
        )}
      </>
    ) : (
      <span style={{ color: '#999', fontSize: '0.8rem' }}>No tags</span>
    )}
  </Box>
);

export default TagsCell; 