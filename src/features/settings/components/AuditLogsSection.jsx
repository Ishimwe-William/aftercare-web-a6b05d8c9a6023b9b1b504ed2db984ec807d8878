import React, {useState, useEffect} from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TextField,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Grid
} from '@mui/material';
import {Search, Refresh} from '@mui/icons-material';
import apiClient from '../../../config/apiConfig';
import {formatDate} from '../../../utils/dateUtils';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const AuditLogsSection = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [filters, setFilters] = useState({
        action: '',
        userId: '',
        searchQuery: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: rowsPerPage,
                ...(filters.action && {action: filters.action}),
                ...(filters.userId && {userId: filters.userId})
            };

            const response = await apiClient.get('/activity-logs/recent', {params});
            setLogs(response.data.content || []);
            setTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) => {
        setFilters({...filters, [field]: value});
    };

    const handleSearch = () => {
        setPage(0);
        fetchLogs();
    };

    const handleReset = () => {
        setFilters({action: '', userId: '', searchQuery: ''});
        setPage(0);
        setTimeout(() => fetchLogs(), 100);
    };

    const getActionColor = (action) => {
        const actionMap = {
            'USER_CREATED': 'success',
            'USER_UPDATED': 'info',
            'USER_DELETED': 'error',
            'USER_STATUS_CHANGED': 'warning',
            'PASSWORD_CHANGED': 'primary',
            'PROFILE_UPDATED': 'info',
        };
        return actionMap[action] || 'default';
    };

    // Filter logs by search query
    const filteredLogs = logs.filter(log => {
        if (!filters.searchQuery) return true;
        const query = filters.searchQuery.toLowerCase();
        return (
            log.username?.toLowerCase().includes(query) ||
            log.action?.toLowerCase().includes(query) ||
            log.details?.toLowerCase().includes(query) ||
            log.userId?.toLowerCase().includes(query)
        );
    });

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Audit Logs
            </Typography>

            <Paper sx={{p: 2, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}> <InputLabel>Action</InputLabel>
                            <Select
                                variant='outlined'
                                value={filters.action}
                                label="Action"
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                            >
                                <MenuItem value="">All Actions</MenuItem>
                                <MenuItem value="USER_CREATED">User Created</MenuItem>
                                <MenuItem value="USER_UPDATED">User Updated</MenuItem>
                                <MenuItem value="USER_DELETED">User Deleted</MenuItem>
                                <MenuItem value="USER_STATUS_CHANGED">Status Changed</MenuItem>
                                <MenuItem value="PASSWORD_CHANGED">Password Changed</MenuItem>
                                <MenuItem value="PROFILE_UPDATED">Profile Updated</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="User ID"
                            value={filters.userId}
                            onChange={(e) => handleFilterChange('userId', e.target.value)}
                            placeholder="Filter by user ID"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            placeholder="Search logs..."
                            InputProps={{
                                startAdornment: <Search sx={{mr: 1, color: 'text.secondary'}}/>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Box sx={{display: 'flex', gap: 1}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSearch}
                                fullWidth
                            >
                                Apply
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Refresh/>}
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? <LoadingSpinner/> : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.logId}>
                                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    {log.userName || 'Unknown'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {log.userId}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.action.replace(/_/g, ' ')}
                                                color={getActionColor(log.action)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{maxWidth: 400}}>
                                                {log.details}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={totalElements}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </>
            )}
        </Box>
    );
};

export default AuditLogsSection;