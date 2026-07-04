'use client';

import { useEffect, useState } from 'react';

export const SkipNav = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleFocus = () => setShow(true);
    const handleBlur = () => setShow(false);
    
    const link = document.getElementById('skip-nav');
    link?.addEventListener('focus', handleFocus);
    link?.addEventListener('blur', handleBlur);
    
    return () => {
      link?.removeEventListener('focus', handleFocus);
      link?.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <a
      id="skip-nav"
      href="#main-content"
      className={`
        fixed left-4 top-4 z-[9999] rounded-full bg-brand-cyan px-6 py-3
        font-fredoka font-semibold text-white shadow-lg
        transition-transform focus:translate-y-0
        ${show ? 'translate-y-0' : '-translate-y-20'}
      `}
    >
      Skip to main content
    </a>
  );
};
