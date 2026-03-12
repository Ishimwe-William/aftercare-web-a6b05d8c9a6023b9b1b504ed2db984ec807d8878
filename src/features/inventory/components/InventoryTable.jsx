import React, { useState, useMemo } from 'react';
import {
    Paper,
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Badge,
    TableSortLabel
} from '@mui/material';
import { Edit, Inventory, History, FileDownload, Delete } from '@mui/icons-material';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

// --- Sorting Helper Functions ---
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// --- Table Header Configuration ---
const headCells = [
    { id: 'id', label: 'Part ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'description', label: 'Description', sortable: false },
    { id: 'quantityAvailable', label: 'Available Qty', sortable: true },
    { id: 'status', label: 'Status', sortable: false }, // Status is derived, not a direct field usually
    { id: 'cost', label: 'Cost', sortable: true },
    { id: 'supplierName', label: 'Supplier', sortable: true },
    { id: 'totalUsed', label: 'Total Used', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
];

const InventoryTable = ({
                            parts,
                            loading,
                            pagination,
                            onEditPart,
                            onUpdateStock,
                            onViewUsage,
                            onExport,
                            onDelete,
                            onPageChange,
                            onRowsPerPageChange
                        }) => {
    // Initial state sorted by 'createdAt' descending
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt');

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getStockStatus = (stock, threshold) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'error' };
        if (stock <= threshold) return { label: 'Low Stock', color: 'warning' };
        return { label: 'In Stock', color: 'success' };
    };

    // Apply sorting to the parts array
    const sortedParts = useMemo(() => {
        return stableSort(parts, getComparator(order, orderBy));
    }, [parts, order, orderBy]);

    return (
        <Paper sx={{ width: '100%' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Inventory List</Typography>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
                    Export Report
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.sortable ? (
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(headCell.id)}
                                        >
                                            {headCell.label}
                                        </TableSortLabel>
                                    ) : (
                                        headCell.label
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <LoadingSpinner />
                                </TableCell>
                            </TableRow>
                        ) : sortedParts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No parts found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedParts.map((part) => {
                                const status = getStockStatus(part.quantityAvailable, part.lowStockThreshold);
                                return (
                                    <TableRow key={part.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                {part.id?.substring(0, 8)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {part.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {part.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                badgeContent={part.quantityAvailable <= part.lowStockThreshold ? '!' : 0}
                                                color="error"
                                            >
                                                <Typography>{part.quantityAvailable} units</Typography>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={status.label} color={status.color} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{part.cost?.toFixed(2)} RWF</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{part.supplierName || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{part.totalUsed || 0} units</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => onEditPart(part)}
                                                    title="Edit Part Details"
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() => onUpdateStock(part)}
                                                    title="Update Stock"
                                                >
                                                    <Inventory fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => onViewUsage(part)}
                                                    title="View Usage History"
                                                >
                                                    <History fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onDelete(part)}
                                                    title="Delete Part"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {pagination && (
                <TablePagination
                    component="div"
                    count={pagination.totalElements || 0}
                    page={pagination.currentPage || 0}
                    onPageChange={onPageChange}
                    rowsPerPage={pagination.size || 20}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                />
            )}
        </Paper>
    );
};

export default InventoryTable;