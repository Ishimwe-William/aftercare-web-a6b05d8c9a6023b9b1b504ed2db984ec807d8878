import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336'];

const VehicleCharts = ({ statistics }) => {
    const chartData = statistics ? [
        { name: 'Total', value: statistics.totalMotorcycles },
        { name: 'Active', value: statistics.activeMotorcycles },
        { name: 'In Service', value: statistics.inServiceMotorcycles },
        { name: 'Need Service', value: statistics.motorcyclesNeedingService }
    ] : [];

    const pieData = statistics ? [
        { name: 'Active', value: statistics.activeMotorcycles },
        { name: 'Inactive', value: statistics.inactiveMotorcycles },
        { name: 'In Service', value: statistics.inServiceMotorcycles }
    ] : [];

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} size="grow">
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Overview Statistics
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#2196F3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} size="grow">
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Status Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default VehicleCharts;