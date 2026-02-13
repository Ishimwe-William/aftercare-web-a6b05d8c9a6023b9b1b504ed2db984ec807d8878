import React, {useState, useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Box, Typography, Snackbar, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, DialogContentText
} from '@mui/material';
import {
    fetchInventory, fetchStockAlerts, fetchMostUsedParts,
    createPart, updatePart, adjustStock, fetchPartUsageHistory,
    exportInventoryReport, searchParts, deletePart,
    clearError
} from './inventorySlice';
import InventoryFilters from './components/InventoryFilters';
import StockAlerts from './components/StockAlerts';
import InventoryTable from './components/InventoryTable';
import AddPartDialog from './components/AddPartDialog';
import UpdateStockDialog from './components/UpdateStockDialog';
import UsageHistoryDialog from './components/UsageHistoryDialog';
import MostUsedParts from './components/MostUsedParts';

const InventoryPage = () => {
    const dispatch = useDispatch();
    const {
        parts,
        alerts,
        usageHistory,
        mostUsedParts,
        pagination,
        loading,
        usageLoading,
        error
    } = useSelector(state => state.inventory);

    const [filters, setFilters] = useState({stockLevel: 'all', search: '', supplier: ''});
    const [selectedPart, setSelectedPart] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [usageOpen, setUsageOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (filters.search) {
                dispatch(searchParts({keyword: filters.search, page: 0, size: pagination.size || 20}));
            } else {
                loadInventory(0, pagination.size || 20);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [filters.search]);

    const loadData = async () => {
        await Promise.all([
            dispatch(fetchInventory({page: 0, size: 20})).unwrap(),
            dispatch(fetchStockAlerts()).unwrap(),
            dispatch(fetchMostUsedParts()).unwrap()
        ]);
    };

    const loadInventory = (page, size) => dispatch(fetchInventory({page, size}));

    const handleSubmitPart = async (partData, partId) => {
        try {
            if (partId) {
                await dispatch(updatePart({id: partId, partData})).unwrap();
                setEditOpen(false);
                showSnackbar('Part updated successfully', 'success');
            } else {
                await dispatch(createPart(partData)).unwrap();
                setAddOpen(false);
                showSnackbar('Part added successfully', 'success');
            }
            await loadData();
        } catch (err) {
            showSnackbar(err.message || 'Failed to save part', 'error');
        }
    };

    const handleEditPart = (part) => {
        setSelectedPart(part);
        setEditOpen(true);
    };

    const handleUpdateStock = (part) => {
        setSelectedPart(part);
        setUpdateOpen(true);
    };

    const handleStockAdjustment = async (partId, {targetQuantity, reason}) => {
        try {
            await dispatch(adjustStock({id: partId, adjustmentData: {targetQuantity, reason}})).unwrap();
            setUpdateOpen(false);
            showSnackbar('Stock updated successfully', 'success');
            await loadData();
        } catch (err) {
            showSnackbar(err.message || 'Failed to update stock', 'error');
        }
    };

    const handleViewUsage = async (part) => {
        setSelectedPart(part);
        setUsageOpen(true);
        await dispatch(fetchPartUsageHistory(part.id));
    };

    const handleDeleteClick = (part) => {
        setPartToDelete(part);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await dispatch(deletePart(partToDelete.id)).unwrap();
            setDeleteConfirmOpen(false);
            setPartToDelete(null);
            showSnackbar('Part deleted successfully', 'success');
            await loadData();
        } catch (err) {
            showSnackbar('Cannot delete part with usage history', 'error');
        }
    };

    const handleExportReport = async () => {
        try {
            const blob = await dispatch(exportInventoryReport()).unwrap();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showSnackbar('Report exported successfully', 'success');
        } catch {
            showSnackbar('Failed to export report', 'error');
        }
    };

    const handleExportUsageHistory = () => {
        if (!usageHistory?.length) return showSnackbar('No usage history to export', 'info');

        const csv = [
            ['Date', 'Task ID', 'Part Name', 'Quantity Used', 'Cost', 'Notes'],
            ...usageHistory.map(u => [
                new Date(u.usedAt).toLocaleString(),
                u.taskId,
                u.partName,
                u.quantityUsed,
                u.cost,
                u.notes || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usage_${selectedPart.name}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showSnackbar('Usage history exported', 'success');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({open: true, message, severity});
    };

    const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);

    const filteredParts = parts.filter(p => {
        if (filters.stockLevel === 'low') return p.quantityAvailable > 0 && p.quantityAvailable <= p.lowStockThreshold;
        if (filters.stockLevel === 'out') return p.quantityAvailable === 0;
        return true;
    });

    return (
        <Box sx={{p: 3, minHeight: '100vh', bgcolor: '#f5f5f5'}}>
            <Typography variant="h4" gutterBottom mb={3}>Inventory Management</Typography>
            <StockAlerts alerts={alerts}/>
            <MostUsedParts parts={mostUsedParts}/>

            <InventoryFilters filters={filters} onFilterChange={handleFilterChange} onAddNew={() => setAddOpen(true)}/>

            <InventoryTable
                parts={filteredParts}
                loading={loading}
                pagination={pagination}
                onUpdateStock={handleUpdateStock}
                onEditPart={handleEditPart}
                onViewUsage={handleViewUsage}
                onExport={handleExportReport}
                onDelete={handleDeleteClick}
                onPageChange={(_, page) => loadInventory(page, pagination.size)}
                onRowsPerPageChange={e => loadInventory(0, +e.target.value)}
            />

            <AddPartDialog open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleSubmitPart}/>
            <AddPartDialog open={editOpen} part={selectedPart} onClose={() => setEditOpen(false)}
                           onSubmit={handleSubmitPart}/>
            <UpdateStockDialog open={updateOpen} part={selectedPart} onClose={() => setUpdateOpen(false)}
                               onSubmit={handleStockAdjustment}/>
            <UsageHistoryDialog open={usageOpen} part={selectedPart} usageHistory={usageHistory} loading={usageLoading}
                                onClose={() => setUsageOpen(false)} onExport={handleExportUsageHistory}/>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Part?</DialogTitle>
                <DialogContent><DialogContentText>Delete "{partToDelete?.name}"
                    permanently?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open || !!error} autoHideDuration={6000} onClose={() => {
                setSnackbar({...snackbar, open: false});
                dispatch(clearError());
            }}>
                <Alert severity={error ? 'error' : snackbar.severity}>{error || snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default InventoryPage;