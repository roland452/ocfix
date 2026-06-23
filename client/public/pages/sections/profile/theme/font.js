import { create } from "zustand";

const useFont = create(() => ({

    fonts:[
        // Sans Serif (Modern & Clean)
        { name: 'Inter' },
        { name: 'Montserrat' },
        { name: 'Roboto' },
        { name: 'Open Sans' },
        { name: 'Poppins' },
        { name: 'Lato' },
        { name: 'Ubuntu' },
        { name: 'Helvetica' },
        { name: 'Futura' },
        { name: 'Gill Sans' },

        // Serif (Classic & Elegant)
        { name: 'Playfair Display' },
        { name: 'Merriweather' },
        { name: 'Lora' },
        { name: 'PT Serif' },
        { name: 'Garamond' },
        { name: 'Baskerville' },
        { name: 'Georgia' },
        { name: 'Times New Roman' },

        // Monospace (Technical & Coding)
        { name: 'Fira Code' },
        { name: 'JetBrains Mono' },
        { name: 'Source Code Pro' },
        { name: 'Courier New' },
        { name: 'Space Mono' },

        // Display & Script (Creative & Unique)
        { name: 'Pacifico' },
        { name: 'Dancing Script' },
        { name: 'Lobster' },
        { name: 'Bebas Neue' },
        { name: 'Abril Fatface' },
        { name: 'Comic Sans MS' },
        { name: 'Syncopate' }
    ]
}))


export default useFont