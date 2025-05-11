import { Event, People, School, Vaccines } from "@mui/icons-material";
import { Box, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const DashboardSkeleton = () => {
    const { t } = useTranslation();

    return (
        <Box>
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                }}
            >
                <Typography variant="h4" component="h1" sx={{ color: "#fff" }}>
                    {t("dashboard.title")}
                </Typography>
                <Box flexGrow={1} />
                <Skeleton
                    variant="text"
                    width="250px"
                    height={60}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                />
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Students Card */}
                <Grid size={3}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            bgcolor: "#0d47a1",
                            borderRadius: 2,
                            color: "#fff",
                            boxShadow: 3,
                            border: "none",
                        }}
                    >
                        <School sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                        <Skeleton
                            variant="text"
                            width="80%"
                            height={28}
                            sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                        <Skeleton
                            variant="text"
                            width="40%"
                            height={48}
                            sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                    </Paper>
                </Grid>

                {/* Vaccinated Students Card */}
                <Grid size={3}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            bgcolor: "#1b5e20",
                            borderRadius: 2,
                            color: "#fff",
                            boxShadow: 3,
                            border: "none",
                        }}
                    >
                        <People sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                        <Skeleton
                            variant="text"
                            width="80%"
                            height={28}
                            sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                        <Skeleton
                            variant="text"
                            width="40%"
                            height={48}
                            sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                    </Paper>
                </Grid>

                {/* Vaccination Percentage Card */}
                <Grid size={3}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            bgcolor: "#f9a825",
                            borderRadius: 2,
                            color: "#fff",
                            boxShadow: 3,
                            border: "none",
                        }}
                    >
                        <Vaccines sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                        <Skeleton
                            variant="text"
                            width="80%"
                            height={28}
                            sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                        <Skeleton
                            variant="text"
                            width="40%"
                            height={48}
                            sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                        <Box sx={{ width: "100%", mt: 1 }}>
                            <Skeleton
                                variant="rounded"
                                width="100%"
                                height={10}
                                sx={{
                                    borderRadius: 5,
                                    bgcolor: "rgba(255,255,255,0.2)",
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Upcoming Drives Card */}
                <Grid size={3}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            bgcolor: "#6a1b9a",
                            borderRadius: 2,
                            color: "#fff",
                            boxShadow: 3,
                            border: "none",
                        }}
                    >
                        <Event sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                        <Skeleton
                            variant="text"
                            width="80%"
                            height={28}
                            sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                        <Skeleton
                            variant="text"
                            width="40%"
                            height={48}
                            sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.2)" }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Upcoming Drives Section */}
            <Box sx={{ mb: 4 }}>
                <Skeleton
                    variant="text"
                    width={180}
                    height={32}
                    sx={{ mb: 2 }}
                />
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid size={4} key={item}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    height: "100%",
                                    minHeight: 200,
                                    bgcolor: "rgba(255, 255, 255, 0.05)",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        mb: 2,
                                    }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width={100}
                                        height={24}
                                    />
                                </Box>
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={28}
                                />
                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={24}
                                    sx={{ mt: 2 }}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mt: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width={120}
                                        height={24}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={120}
                                        height={24}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mt: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width={80}
                                        height={24}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={80}
                                        height={24}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={80}
                                        height={24}
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Completed Drives Section */}
            <Box>
                <Skeleton
                    variant="text"
                    width={180}
                    height={32}
                    sx={{ mb: 2 }}
                />
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid size={4} key={item}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    height: "100%",
                                    minHeight: 200,
                                    bgcolor: "rgba(255, 255, 255, 0.05)",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        mb: 2,
                                    }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width={100}
                                        height={24}
                                    />
                                </Box>
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={28}
                                />
                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={24}
                                    sx={{ mt: 2 }}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mt: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width={120}
                                        height={24}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={120}
                                        height={24}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mt: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width={80}
                                        height={24}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={80}
                                        height={24}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={80}
                                        height={24}
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default DashboardSkeleton;
