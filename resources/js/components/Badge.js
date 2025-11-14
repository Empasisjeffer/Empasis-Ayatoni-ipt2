import React from 'react';

export default function Badge({ value }) {
  const isActive = String(value).toLowerCase() === 'active';
  const styles = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 9999,
    fontSize: 12,
    background: isActive ? '#DCFCE7' : '#E5E7EB',
    color: isActive ? '#065F46' : '#374151'
  };
  return <span style={styles}>{value}</span>;
}
