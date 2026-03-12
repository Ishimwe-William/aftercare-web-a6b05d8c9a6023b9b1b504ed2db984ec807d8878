import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Box, Typography, Snackbar, Alert} from '@mui/material';
import {clearError, clearSuccessMessage} from './monitoringSlice';
import {fetchTechnicians} from '../technicians/technicianSlice';
import {fetchAlerts, fetchCaseDetails, fetchServiceCases, fetchStatistics, reassignTask} from "./monitoringThunks";
import {fetchRecentLaborRate} from '../settings/laborRateSlice';
import {fetchTaskInvoices} from '../../store/slices/invoiceSlice';
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
import usePdfExport from '../../hooks/usePdfExport';

const MonitoringPage = () => {
    const dispatch = useDispatch();
    const {casesPage, currentCase, alerts, stats, loading, error, successMessage} = useSelector(s => s.monitoring);
    const {currentInvoice: invoice} = useSelector(s => s.invoice);
    const {laborRate} = useSelector(s => s.laborRate);

    const {technicians} = useSelector(s => s.technicians);

    const {exportPdf, isExporting, error: pdfError} = usePdfExport();

    const [filters, setFilters] = useState({
        status: '',
        technicianId: '',
        motorcycleId: '',
        dateRange: '',
        startDate: null,
        endDate: null,
    });

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

    // Reset pagination when filters change
    useEffect(() => {
        setPage(0);
    }, [filters]);

    const handleChangePage = (_, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
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

            if (filters.startDate && filters.endDate) {
                if (!caseItem.createdAt) {
                    matchesDate = false;
                } else {
                    const caseDate = new Date(caseItem.createdAt);
                    const start = new Date(filters.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(filters.endDate);
                    end.setHours(23, 59, 59, 999);
                    matchesDate = caseDate >= start && caseDate <= end;
                }
            } else if (filters.dateRange) {
                if (!caseItem.createdAt) {
                    matchesDate = false;
                } else {
                    const caseDate = new Date(caseItem.createdAt);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    switch (filters.dateRange) {
                        case 'today':
                            matchesDate = caseDate.toDateString() === today.toDateString();
                            break;
                        case 'week': {
                            const w = new Date(today);
                            w.setDate(today.getDate() - 7);
                            matchesDate = caseDate >= w;
                            break;
                        }
                        case 'month': {
                            const m = new Date(today);
                            m.setMonth(today.getMonth() - 1);
                            matchesDate = caseDate >= m;
                            break;
                        }
                        case 'year': {
                            const y = new Date(today);
                            y.setFullYear(today.getFullYear() - 1);
                            matchesDate = caseDate >= y;
                            break;
                        }
                        default:
                            break;
                    }
                }
            }

            return matchesStatus && matchesTechnician && matchesMotorcycle && matchesDate;
        });
    };

    const filteredCases = filterCases(casesPage?.content || []);

    // Accommodate the "All" (-1) option from MUI pagination smoothly
    const actualRowsPerPage = rowsPerPage === -1 ? filteredCases.length : rowsPerPage;
    const paginatedCases = filteredCases.slice(page * actualRowsPerPage, page * actualRowsPerPage + actualRowsPerPage);

    const handleExportPdf = async () => {
        if (!filteredCases.length) {
            alert("No cases to export after applying filters.");
            return;
        }

        // Use the exact same filtered list as CSV + table view
        const completedCases = filteredCases.filter(c => c.status === 'COMPLETED');

        // Enrich only completed cases with invoice data (for costs in PDF)
        const casesWithInvoices = await Promise.all(
            completedCases.map(async (caseItem) => {
                try {
                    const invoiceResult = await dispatch(
                        fetchTaskInvoices(caseItem.caseId)
                    );
                    return {
                        ...caseItem,
                        invoice: invoiceResult?.payload || null
                    };
                } catch (err) {
                    console.warn(`Invoice fetch failed for ${caseItem.caseId}`, err);
                    return { ...caseItem, invoice: null };
                }
            })
        );

        // Merge invoice data back into full filtered list
        const enrichedCases = filteredCases.map(c => {
            if (c.status === 'COMPLETED') {
                const withInvoice = casesWithInvoices.find(ci => ci.caseId === c.caseId);
                return withInvoice || c;
            }
            return c;
        });

        exportPdf({
            type: 'monitoringReport',
            data: {
                cases: enrichedCases,
                filters,
            },
        });
    };

    const handleGenerateInvoice = (caseItem) => {
        setSelectedCase(caseItem);
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
        }))
            .then(() => {
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
            />

            {pdfError && <Alert severity="error" sx={{mb: 2}}>PDF export failed: {pdfError}</Alert>}

            <AlertsSection alerts={alerts} onAlertClick={handleViewDetails}/>

            <ViewControls
                viewMode={viewMode}
                setViewMode={setViewMode}
                cases={filteredCases}
                onExportPdf={handleExportPdf}
                isExporting={isExporting}
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

            <CaseDetailsDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} caseDetails={currentCase}/>

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