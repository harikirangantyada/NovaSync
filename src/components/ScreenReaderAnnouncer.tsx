/**
 * NovaCart Screen Reader Announcer
 * ARIA Live Region for accessible voice feedback to assistive technology users.
 */

import React from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
}

export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
