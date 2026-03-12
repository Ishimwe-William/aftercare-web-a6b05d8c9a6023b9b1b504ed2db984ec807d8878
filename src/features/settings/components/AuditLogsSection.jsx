import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Grid,
    Skeleton,
    Tooltip,
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import apiClient from '../../../config/apiConfig';
import { formatDate } from '../../../utils/dateUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

// ─── Module-level actions cache ───────────────────────────────────────────────
// Persists across re-mounts (e.g. switching tabs) without needing Redux.
const actionsCache = { data: null, fetchedAt: null };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const isCacheValid = () =>
    actionsCache.data !== null &&
    actionsCache.fetchedAt !== null &&
    Date.now() - actionsCache.fetchedAt < CACHE_TTL_MS;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPTY_FILTERS = { action: '', userId: '', searchQuery: '' };

/** "USER_CREATED_ADMIN" → "User Created Admin" */
const formatAction = (action) =>
    action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ACTION_CHIP_COLORS = {
    USER_CREATED:        'success',
    USER_CREATED_ADMIN:  'success',
    USER_UPDATED:        'info',
    USER_DELETED:        'error',
    USER_STATUS_CHANGED: 'warning',
    PASSWORD_CHANGED:    'primary',
    PROFILE_UPDATED:     'info',
    TASK_CREATED:        'default',
    TASK_UPDATED:        'default',
    TASK_DELETED:        'error',
};

const getActionColor = (action) => ACTION_CHIP_COLORS[action] ?? 'default';

/**
 * Multi-column search — tests every searchable column in a row.
 * Normalises action strings so "user crea" matches "USER_CREATED_ADMIN".
 */
const rowMatchesQuery = (log, rawQuery) => {
    if (!rawQuery) return true;
    const q = rawQuery.toLowerCase().trim();
    const actionNormalised = (log.action ?? '').replace(/_/g, ' ').toLowerCase();
    return (
        (log.userName  ?? '').toLowerCase().includes(q) ||
        (log.userId    ?? '').toLowerCase().includes(q) ||
        (log.action    ?? '').toLowerCase().includes(q) ||
        actionNormalised.includes(q)                    ||
        (log.details   ?? '').toLowerCase().includes(q) ||
        (log.logId     ?? '').toLowerCase().includes(q) ||
        formatDate(log.timestamp).toLowerCase().includes(q)
    );
};

// ─── Component ────────────────────────────────────────────────────────────────
const AuditLogsSection = () => {
    const [logs,           setLogs]           = useState([]);
    const [loading,        setLoading]        = useState(false);
    const [page,           setPage]           = useState(0);
    const [rowsPerPage,    setRowsPerPage]    = useState(10);
    const [totalElements,  setTotalElements]  = useState(0);
    const [filters,        setFilters]        = useState(EMPTY_FILTERS);
    const [availableActions, setAvailableActions] = useState(actionsCache.data ?? []);
    const [actionsLoading, setActionsLoading] = useState(!isCacheValid());

    const abortRef = useRef(null);

    // ── Fetch distinct actions with module-level cache ────────────────────────
    useEffect(() => {
        if (isCacheValid()) {
            setAvailableActions(actionsCache.data);
            setActionsLoading(false);
            return;
        }

        const controller = new AbortController();
        setActionsLoading(true);

        apiClient
            .get('/activity-logs/actions', { signal: controller.signal })
            .then(({ data }) => {
                actionsCache.data      = data;
                actionsCache.fetchedAt = Date.now();
                setAvailableActions(data);
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    console.error('Failed to fetch action types:', err);
                }
            })
            .finally(() => setActionsLoading(false));

        return () => controller.abort();
    }, []);

    // ── Fetch logs (accepts overrides to avoid stale-closure bugs) ────────────
    const fetchLogs = useCallback(
        async (overrideFilters = null, overridePage = null) => {
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            setLoading(true);
            const activeFilters = overrideFilters ?? filters;
            const activePage    = overridePage    ?? page;

            try {
                const params = {
                    page: activePage,
                    size: rowsPerPage,
                    ...(activeFilters.action && { action: activeFilters.action }),
                    ...(activeFilters.userId && { userId: activeFilters.userId }),
                };
                const { data } = await apiClient.get('/activity-logs/recent', {
                    params,
                    signal: abortRef.current.signal,
                });
                setLogs(data.content ?? []);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    console.error('Failed to fetch logs:', err);
                }
            } finally {
                setLoading(false);
            }
        },
        [filters, page, rowsPerPage]
    );

    // Pagination changes auto-fetch; filter changes are always explicit via Apply
    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage]);

    useEffect(() => () => abortRef.current?.abort(), []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChangePage = (_e, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) =>
        setFilters((prev) => ({ ...prev, [field]: value }));

    const handleSearch = () => {
        setPage(0);
        fetchLogs(filters, 0);
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        setPage(0);
        fetchLogs(EMPTY_FILTERS, 0);
    };

    // Client-side multi-column search
    const filteredLogs = logs.filter((log) =>
        rowMatchesQuery(log, filters.searchQuery)
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Audit Logs
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">

                    {/* Action dropdown — populated dynamically from DB */}
                    <Grid item xs={12} sm={3} sx={{ minWidth: 120}}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Action</InputLabel>
                            <Select
                                value={filters.action}
                                label="Action"
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                disabled={actionsLoading}
                            >
                                <MenuItem value="">All Actions</MenuItem>
                                {actionsLoading
                                    ? [1, 2, 3].map((n) => (
                                        <MenuItem key={n} disabled>
                                            <Skeleton width={160} />
                                        </MenuItem>
                                    ))
                                    : availableActions.map((action) => (
                                        <MenuItem key={action} value={action}>
                                            {formatAction(action)}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* User ID */}
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

                    {/* Multi-column search */}
                    <Grid item xs={12} sm={3}>
                        <Tooltip
                            title="Searches: name, user ID, action, details, log ID, timestamp"
                            placement="top"
                            arrow
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Search"
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search all columns..."
                                InputProps={{
                                    startAdornment: (
                                        <Search sx={{ mr: 1, color: 'text.secondary' }} />
                                    ),
                                }}
                            />
                        </Tooltip>
                    </Grid>

                    {/* Buttons */}
                    <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" color="primary" onClick={handleSearch} fullWidth>
                                Apply
                            </Button>
                            <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={handleReset}>
                                Reset
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <LoadingSpinner />
            ) : (
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
                                    <TableRow key={log.logId} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {formatDate(log.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    {log.userName || 'Unknown'}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                                >
                                                    {log.userId}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatAction(log.action)}
                                                color={getActionColor(log.action)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 400 }}>
                                                {log.details}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No logs found
                                            </Typography>
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