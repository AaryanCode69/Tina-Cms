/* ============================================================
 * StatusBadge Component
 * Visual indicator for form/submission status.
 * ============================================================ */

import React from 'react';

interface StatusBadgeProps {
  status: 'idle' | 'validating' | 'valid' | 'invalid' | 'submitting' | 'success' | 'error';
  message?: string;
}

const STATUS_CONFIG = {
  idle: { label: 'Draft', icon: '○' },
  validating: { label: 'Validating...', icon: '◌' },
  valid: { label: 'Valid', icon: '✓' },
  invalid: { label: 'Invalid', icon: '✗' },
  submitting: { label: 'Submitting...', icon: '◌' },
  success: { label: 'Submitted', icon: '✓' },
  error: { label: 'Error', icon: '✗' },
};

export default function StatusBadge({ status, message }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`status-badge status-badge--${status}`} title={message}>
      <span className="status-badge__icon" aria-hidden="true">{config.icon}</span>
      <span className="status-badge__label">{message || config.label}</span>
    </span>
  );
}
