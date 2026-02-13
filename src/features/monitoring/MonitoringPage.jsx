import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Box, Typography, Snackbar, Alert} from '@mui/material';
import {clearError, clearSuccessMessage} from './monitoringSlice';
import {fetchTechnicians} from '../technicians/technicianSlice';
import {fetchAlerts, fetchCaseDetails, fetchServiceCases, fetchStatistics, reassignTask} from "./monitoringThunks";
import {fetchRecentLaborRate} from '../settings/laborRateSlice';
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatsCards from './components/StatsCards';
import FilterPanel from './components/FilterPanel';
import AlertsSection from './components/AlertsSection';
import ViewControls from './components/ViewControls';
import CasesTableView from './components/CasesTableView';
import CasesCardView from './components/CasesCardView';
import CaseDetailsDialog from './components/CaseDetailsDialog';
import ReassignDialog from './components/ReassignDialog';
import InvoicePreviewDialog from './components/InvoicePreviewDialog';

const MonitoringPage = () => {
    const dispatch = useDispatch();
    const {casesPage, currentCase, alerts, stats, loading, error, successMessage} = useSelector(s => s.monitoring);
    const {currentInvoice: invoice} = useSelector(s => s.invoice);
    const {laborRate} = useSelector(s => s.laborRate);

    const {technicians} = useSelector(s => s.technicians);

    const [filters, setFilters] = useState({status: '', technicianId: '', motorcycleId: '', dateRange: ''});
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [reassignOpen, setReassignOpen] = useState(false);
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [newTechnicianId, setNewTechnicianId] = useState('');
    const [viewMode, setViewMode] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchTechnicians());
        dispatch(fetchAlerts());
        dispatch(fetchStatistics());
        dispatch(fetchServiceCases({}));
        dispatch(fetchRecentLaborRate());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filterCases = (cases) => {
        if (!cases) return [];
        return cases.filter(caseItem => {
            const matchesStatus = !filters.status || caseItem.status === filters.status;
            const matchesTechnician = !filters.technicianId || caseItem.technicianId === filters.technicianId;

            const matchesMotorcycle = !filters.motorcycleId ||
                (caseItem.motorcycle?.plateNumber?.toLowerCase().includes(filters.motorcycleId.toLowerCase()));

            let matchesDate = true;
            if (filters.dateRange) {
                if (!caseItem.createdAt) return false;

                const caseDate = new Date(caseItem.createdAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (filters.dateRange) {
                    case 'today':
                        matchesDate = caseDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        matchesDate = caseDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        matchesDate = caseDate >= monthAgo;
                        break;
                    case 'year':
                        const yearAgo = new Date(today);
                        yearAgo.setFullYear(today.getFullYear() - 1);
                        matchesDate = caseDate >= yearAgo;
                        break;
                }
            }

            return matchesStatus && matchesTechnician && matchesMotorcycle && matchesDate;
        });
    };

    const applyFilters = () => {
        setPage(0);
    };

    const filteredCases = filterCases(casesPage?.content || []);
    const paginatedCases = filteredCases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleGenerateInvoice = (caseItem) => {
        setSelectedCase(caseItem);   // optional: pass minimal info to dialog
        setInvoiceOpen(true);
    };


    const handleViewDetails = (caseItem) => {
        dispatch(fetchCaseDetails(caseItem.caseId)).then(() => {
            setSelectedCase(caseItem);
            setDetailsOpen(true);
        });
    };

    const handleReassign = (caseItem) => {
        setSelectedCase(caseItem);
        setReassignOpen(true);
    };

    const submitReassign = () => {
        if (!newTechnicianId || !selectedCase) return;
        dispatch(reassignTask({
            taskId: selectedCase.caseId,
            newTechnicianId,
            reason: 'Reassigned via monitoring dashboard'
        })).then(() => {
            setReassignOpen(false);
            setNewTechnicianId('');
            dispatch(fetchServiceCases({}));
        });
    };

    if (loading && !casesPage?.content) return <LoadingSpinner/>;

    return (
        <Box sx={{p: 3, bgcolor: '#f5f5f5', minHeight: '100vh'}}>
            <Typography variant="h4" gutterBottom>Service Monitoring</Typography>

            <StatsCards stats={stats}/>

            <FilterPanel
                filters={filters}
                setFilters={setFilters}
                technicians={technicians}
                onApply={applyFilters}
            />

            <AlertsSection alerts={alerts} onAlertClick={handleViewDetails}/>

            <ViewControls
                viewMode={viewMode}
                setViewMode={setViewMode}
                cases={filteredCases}
            />

            {viewMode === 0 ? (
                <CasesTableView
                    cases={paginatedCases}
                    totalCases={filteredCases.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onView={handleViewDetails}
                    onReassign={handleReassign}
                    onGenerateInvoice={handleGenerateInvoice}
                />
            ) : (
                <CasesCardView
                    cases={filteredCases}
                    onView={handleViewDetails}
                    onReassign={handleReassign}
                    onGenerateInvoice={handleGenerateInvoice}
                />
            )}

            <CaseDetailsDialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                caseDetails={currentCase}
            />

            <ReassignDialog
                open={reassignOpen}
                onClose={() => setReassignOpen(false)}
                selectedCase={selectedCase}
                technicians={technicians}
                newTechnicianId={newTechnicianId}
                setNewTechnicianId={setNewTechnicianId}
                onSubmit={submitReassign}
            />

            <InvoicePreviewDialog
                open={invoiceOpen}
                onClose={() => setInvoiceOpen(false)}
                caseId={selectedCase?.caseId}
                preloadedCaseDetails={selectedCase?.caseInfo}
                currentInvoice={invoice}
                laborRate={laborRate?.rate}
            />

            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => dispatch(clearError())}>
                <Alert severity="error" onClose={() => dispatch(clearError())}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => dispatch(clearSuccessMessage())}>
                <Alert severity="success" onClose={() => dispatch(clearSuccessMessage())}>{successMessage}</Alert>
            </Snackbar>
        </Box>
    );
};

export default MonitoringPage;