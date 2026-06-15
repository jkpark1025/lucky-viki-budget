const os = require('os');
const _hostname = os.hostname.bind(os);
os.hostname = () => {
  const h = _hostname();
  return h.replace(/[^\x00-\x7F]/g, '').trim() || 'DESKTOP';
};
