export const announce = (message: string) => {
  if (typeof document === 'undefined') return;
  
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = message;
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
};
