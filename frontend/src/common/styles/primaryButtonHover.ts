import theme from "../../theme";

export const primaryButtonHoverSyles = {
    "&:hover": {
        color: theme.palette.primary.main,
        outline: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: "transparent",
    },
};
