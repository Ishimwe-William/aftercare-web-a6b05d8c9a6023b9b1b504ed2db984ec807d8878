import React from 'react';
import {Grid, Paper, Typography, Box} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const Charts = ({timeline, stats}) => {

    // Transform timeline data - format date properly
    const timelineData = timeline?.map(item => {
        const date = new Date(item.timestamp);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        return {
            date: formattedDate,
            cases: (item.pendingCount || 0) + (item.inProgressCount || 0) + (item.completedCount || 0)
        };
    }) || [];

    // Task status pie chart data - fix the path to access taskStats
    const taskStatus = [
        {name: 'Pending', value: stats?.taskStats?.pendingTasks || 0, color: '#ef4444'},
        {name: 'In Progress', value: stats?.taskStats?.inProgressTasks || 0, color: '#f59e0b'},
        {name: 'Completed', value: stats?.taskStats?.completedTasks || 0, color: '#10b981'},
    ];

    // Technician workload - fix to access the correct properties
    const technicianWorkload = stats?.technicianWorkload?.map(tech => ({
        name: tech.fullName || tech.username || 'Unknown',
        tasks: tech.activeTasksCount || 0
    })) || [];

    const hasTimelineData = timelineData.length > 0 && timelineData.some(d => d.cases > 0);
    const hasTaskData = taskStatus.some(s => s.value > 0);
    const hasWorkloadData = technicianWorkload.length > 0 && technicianWorkload.some(t => t.tasks > 0);

    // Custom label for pie chart
    const renderCustomLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent}) => {
        if (percent === 0) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={14}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Box sx={{ mt: 3, mx: -1.5 }}>
            <Grid container spacing={3}>
                <Grid size="grow">
                    <Paper sx={{p: 3, minHeight: 350}}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>Service Timeline</Typography>
                        {hasTimelineData ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={timelineData} margin={{top: 10, right: 20, left: 0, bottom: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                    <XAxis
                                        dataKey="date"
                                        tick={{fontSize: 12, fill: '#666'}}
                                        tickLine={{stroke: '#e0e0e0'}}
                                    />
                                    <YAxis
                                        tick={{fontSize: 12, fill: '#666'}}
                                        tickLine={{stroke: '#e0e0e0'}}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="cases"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        name="Service Cases"
                                        dot={{fill: '#3b82f6', r: 4}}
                                        activeDot={{r: 6}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300}}>
                                <Typography variant="body2" color="text.secondary">
                                    No timeline data available
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
                <Grid size="grow">
                    <Paper sx={{p: 3, minHeight: 350}}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>Task Status</Typography>
                        {hasTaskData ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={taskStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label={renderCustomLabel}
                                        labelLine={false}
                                    >
                                        {taskStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color}/>
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value, entry) => (
                                            <span style={{fontSize: '12px', color: '#666'}}>
                                                        {value}: {entry.payload.value}
                                                    </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300}}>
                                <Typography variant="body2" color="text.secondary">
                                    No task data available
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
                <Grid size="grow">
                    <Paper sx={{p: 3, minHeight: 350}}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>Technician Load</Typography>
                        {hasWorkloadData ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={technicianWorkload}
                                    margin={{top: 10, right: 10, left: -10, bottom: 60}}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                    <XAxis
                                        dataKey="name"
                                        tick={{fontSize: 11, fill: '#666'}}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        interval={0}
                                    />
                                    <YAxis
                                        tick={{fontSize: 12, fill: '#666'}}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                        cursor={{fill: 'rgba(156, 39, 176, 0.1)'}}
                                    />
                                    <Bar
                                        dataKey="tasks"
                                        fill="#9c27b0"
                                        radius={[6, 6, 0, 0]}
                                        name="Active Tasks"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300}}>
                                <Typography variant="body2" color="text.secondary">
                                    No workload data available
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Charts;