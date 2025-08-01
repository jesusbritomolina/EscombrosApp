// src/loadRecaptcha.jsx

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const script = document.createElement('script');
script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
document.body.appendChild(script);
