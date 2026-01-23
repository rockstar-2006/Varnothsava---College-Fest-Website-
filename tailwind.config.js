// tailwind.config.js
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            screens: {
                'xs': '320px', // extra small devices
                '2xl': '1536px', // ultra-wide
            },
            spacing: {
                '9/16': '56.25%', // for 16:9 aspect ratio
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/typography'),
    ],
};
