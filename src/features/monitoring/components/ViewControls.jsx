import {Box, Tabs, Tab, Button} from '@mui/material';
import {FileDownload, PictureAsPdf} from '@mui/icons-material';
import Papa from 'papaparse';

const ViewControls = ({viewMode, setViewMode, cases, onExportPdf, isExporting}) => {
    const handleExport = () => {
        if (!cases.length) return;
        const csv = cases.map(c => ({
            'Case ID': c.caseId,
            'Motorcycle': c.motorcycle.plateNumber,
            'Motorcycle Barcode': c.motorcycle.qrCode,
            'Model': c.motorcycle.model,
            'Issue': c.issue,
            'Issue Type': c.issueType,
            'Technician': c.technician,
            "Technician Id": c.technicianId,
            'Status': c.status,
            'Progress': `${c.progress}%`,
            'Create At': c.createdAt,
            'Start Time': c.startTime ? new Date(c.startTime).toLocaleString() : 'N/A',
            'Due Time': c.dueTime ? new Date(c.dueTime).toLocaleString() : 'N/A',
            'Priority': c.priority || 'N/A',
            'Notes': c.notes || 'N/A',
        }));
        const blob = new Blob([Papa.unparse(csv)], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitoring_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
            <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
                <Tab label="Table View"/>
                <Tab label="Card View"/>
            </Tabs>
            {/* Export buttons — side by side */}
            <Box sx={{display: 'flex', gap: 1}}>
                <Button variant="outlined" startIcon={<FileDownload/>} onClick={handleExport} disabled={!cases.length}>
                    Export CSV
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf fontSize="small"/>}
                    onClick={onExportPdf}
                    disabled={isExporting || !cases.length}>
                    {isExporting ? 'Exporting…' : 'Export PDF'}
                </Button>
            </Box>
        </Box>
    );
};

export default ViewControls;