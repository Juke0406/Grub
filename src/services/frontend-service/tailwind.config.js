/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
      extend: {
        animation: {
          "shiny-text": "shiny-text 8s infinite",
        },
        keyframes: {
          "shiny-text": {
            "0%, 90%, 100%": {
              "background-position": "calc(-100% - var(--shiny-width)) 0",
            },
            "30%, 60%": {
              "background-position": "calc(100% + var(--shiny-width)) 0",
            },
          },
        },
      },
    },
  };