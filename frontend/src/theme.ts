import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        custom: {
            blue: string;
            blueHover: string;
            green: string;
            greenHover: string;
            yellow: string;
            yellowHover: string;
            purple: string;
            purpleHover: string;
        };
    }
    interface PaletteOptions {
        custom: {
            blue: string;
            blueHover: string;
            green: string;
            greenHover: string;
            yellow: string;
            yellowHover: string;
            purple: string;
            purpleHover: string;
        };
    }
}

const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#000000",
            paper: "#121212",
        },
        primary: {
            main: "#00F0FF", // Neon blue
            light: "#33F3FF",
            dark: "#00A8B3",
            contrastText: "#000000",
        },
        secondary: {
            main: "#FF00FF", // Neon magenta/pink
            light: "#FF33FF",
            dark: "#B300B3",
            contrastText: "#000000",
        },
        custom: {
            blue: "#0d47a1",
            blueHover: "#1565c0",
            green: "#1b5e20",
            greenHover: "#388e3c",
            yellow: "#f9a825",
            yellowHover: "#fbc02d",
            purple: "#6a1b9a",
            purpleHover: "#8e24aa",
        },
        text: {
            primary: "#FFFFFF",
            secondary: "rgba(255, 255, 255, 0.7)",
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#121212",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    "&:hover": {
                        backgroundColor: "rgba(0, 240, 255, 0.08)",
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 600,
        },
        h2: {
            fontWeight: 600,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
});

export default theme;
