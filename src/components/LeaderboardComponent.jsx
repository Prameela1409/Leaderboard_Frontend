import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from './Leaderboard'; // Adjust path if needed
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Adjust path if needed

import {
    Button,
    Collapse,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    ListItemText,
    Menu,
    MenuItem,
    OutlinedInput,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Paper,
    IconButton
} from '@mui/material';
import { ExpandMore, ArrowUpward, ArrowDownward } from '@mui/icons-material';

const LeaderboardComponent = () => {
    const [sheets, setSheets] = useState([]);
    const { logout, isAdmin } = useContext(AuthContext);
    const [leaderboard, setLeaderboard] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [newSheet, setNewSheet] = useState({ name: '', url: '', targetColumns: '' });
    const [branchFilter, setBranchFilter] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState({
        'Roll Number': true,
        'Name of the student': true,
        'Branch': true,
    });
    const navigate = useNavigate();
    const initialColumnOrder = [
        "Roll Number",
        "Name of the student",
        "Branch",
        "Total Score"
    ];
    const [columnOrder, setColumnOrder] = useState(initialColumnOrder);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [showAddSheet, setShowAddSheet] = useState(false);
    const allBranches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'AIDS'];

    const leaderboardRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const audioRef = useRef(null);

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 48 * 4.5 + 8,
                width: 250,
            },
        },
    };

    useEffect(() => {
        const fetchSheets = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/getSheets');
                setSheets(response.data || []);
            } catch (error) {
                console.error('Error fetching sheets:', error);
            }
        };

        fetchSheets();
    }, []);

    useEffect(() => {
        const fetchLastScrapedData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/getLeaderboard');
                if (response.data && Array.isArray(response.data)) {
                    const keys = Object.keys(response.data[0]);
                    const predefinedColumns = ["Roll Number", "Name of the student", "Branch", "Total Score"];
                    const otherColumns = keys.filter(key => !predefinedColumns.includes(key));
                    const updatedColumnOrder = [
                        "Roll Number",
                        "Name of the student",
                        "Branch",
                        ...otherColumns,
                        "Total Score"
                    ];
                    const updatedVisibleColumns = {
                        'Roll Number': true,
                        'Name of the student': true,
                        'Branch': true,
                        ...otherColumns.reduce((acc, column) => {
                            acc[column] = true;
                            return acc;
                        }, {}),
                        "Total Score": true
                    };
                    setColumnOrder(updatedColumnOrder);
                    setVisibleColumns(updatedVisibleColumns);
                    setLeaderboard(response.data);
                } else {
                    console.error('Invalid response data:', response.data);
                }
            } catch (error) {
                console.error('Error fetching last scraped data:', error);
            }
        };

        if (sheets.every(sheet => !sheet.selected)) {
            fetchLastScrapedData();
        }
    }, [sheets]);

    const handleBranchChange = (event) => {
        const { target: { value } } = event;
        setBranchFilter(typeof value === 'string' ? value.split(',') : value);
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('isLoggedIn');
        console.log('Logging out...');
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const toggleSheetSelection = (index) => {
        const updatedSheets = [...sheets];
        updatedSheets[index].selected = !updatedSheets[index].selected;
        setSheets(updatedSheets);
    };

    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const addSheet = async () => {
        const formattedTargetColumns = newSheet.targetColumns
            .split(',')
            .map(column => column.trim())
            .filter(column => column);

        try {
            await axios.post('http://127.0.0.1:5000/addSheet', {
                name: newSheet.name,
                url: newSheet.url,
                targetColumns: formattedTargetColumns,
            });
            setShowAddSheet(false);
            setSnackbarMessage('Sheet added successfully!');
            setOpenSnackbar(true);
            setNewSheet({ name: '', url: '', targetColumns: '' });
            const response = await axios.get('http://127.0.0.1:5000/getSheets');
            setSheets(response.data || []);
        } catch (error) {
            console.error('Error adding sheet:', error);
            setSnackbarMessage('Failed to add sheet.');
            setOpenSnackbar(true);
        }
    };

    const runScraping = async () => {
        const selectedSheetIds = sheets
            .filter(sheet => sheet.selected)
            .map(sheet => sheet._id);

        if (selectedSheetIds.length === 0) {
            setSnackbarMessage('No sheets selected for scraping');
            setOpenSnackbar(true);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/scrape', { sheet_ids: selectedSheetIds });
            if (response.data && Array.isArray(response.data)) {
                setLeaderboard(response.data);
                const keys = Object.keys(response.data[0]);
                const predefinedColumns = ["Roll Number", "Name of the student", "Branch", "Total Score"];
                const otherColumns = keys.filter(key => !predefinedColumns.includes(key));
                const updatedColumnOrder = [
                    "Roll Number",
                    "Name of the student",
                    "Branch",
                    ...otherColumns,
                    "Total Score"
                ];
                const updatedVisibleColumns = {
                    'Roll Number': true,
                    'Name of the student': true,
                    'Branch': true,
                    ...otherColumns.reduce((acc, column) => {
                        acc[column] = true;
                        return acc;
                    }, {}),
                    "Total Score": true
                };
                setVisibleColumns(updatedVisibleColumns);
                setColumnOrder(updatedColumnOrder);
                setSnackbarMessage('Scraping completed successfully');
                setOpenSnackbar(true);
            } else {
                console.error('Invalid response data:', response.data);
                setSnackbarMessage('Invalid data received from the server');
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Error scraping data:', error);
            setSnackbarMessage('Error occurred while scraping data. Please try again.');
            setOpenSnackbar(true);
        }
    };

    const filteredLeaderboard = useMemo(() => {
        return leaderboard.filter((entry) =>
            branchFilter.length === 0 || branchFilter.includes(entry.Branch)
        );
    }, [leaderboard, branchFilter]);

    const sortLeaderboard = (column, order) => {
        const sorted = [...filteredLeaderboard].sort((a, b) => {
            const valueA = parseFloat(a[column]) || 0;
            const valueB = parseFloat(b[column]) || 0;
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        });
        setLeaderboard(sorted);
    };

    const topThree = useMemo(() => {
        return leaderboard
            .sort((a, b) => b['Total Score'] - a['Total Score'])
            .slice(0, 3);
    }, [leaderboard]);

    return (
        <div ref={leaderboardRef} className='second' style={{
            display: 'flex',
            padding: '24px',
            backgroundColor: '#f5f6fa',
            minHeight: '100vh',
            lineSpacing: '10px'
        }}>
            {/* Controls Sidebar */}
            <div style={{
                flex: '0 0 240px',
                width: '400px',
                padding: '30px',
                borderRight: '1px solid #e0e0e0',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                marginRight: '3px',
                marginLeft: '-18px'
            }}>
                < div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '11px',
                        backgroundColor: '#f8f9fa',
                        transition: 'all 0.3s ease',
                        margin: '-10PX'
                    }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <Typography variant="h6" style={{
                        margin: 0,
                        fontWeight: 600,
                        color: '#2d3436',
                        fontSize: '20px'
                    }}>
                        Google Sheets Selection
                    </Typography>
                    <ExpandMore style={{
                        marginLeft: 'auto',
                        color: '#9B0F4A'
                    }} />
                </div>

                <Collapse in={dropdownOpen}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        marginTop: '20px'
                    }}>
                        {/* Sheets Selection */}
                        <Button
                            variant="contained"
                            onClick={handleMenuClick}
                            style={{
                                backgroundColor: '#9B0F4A',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                ':hover': {
                                    backgroundColor: '#800f3c',
                                    boxShadow: '0 4px 6px -1px rgba(155, 15, 74, 0.2)'
                                }
                            }}
                        >
                            Select Sheets
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                style: {
                                    width: '250px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            {sheets.map((sheet, index) => (
                                <MenuItem
                                    key={index}
                                    style={{ padding: '8px 16px' }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={sheet.selected}
                                                onChange={() => toggleSheetSelection(index)}
                                                color="primary"
                                                style={{ color: '#9B0F4A' }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body1" style={{ color: '#2d3436' }}>
                                                {sheet.name}
                                            </Typography>
                                        }
                                        style={{ margin: 0 }}
                                    />
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* Admin Controls */}
                        {isAdmin && (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowAddSheet(!showAddSheet)}
                                    style={{
                                        borderColor: '#9B0F4A',
                                        color: '#9B0F4A',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        ':hover': {
                                            backgroundColor: '#fff0f3',
                                            borderColor: '#800f3c'
                                        }
                                    }}
                                >
                                    {showAddSheet ? 'Cancel' : 'Add Sheet'}
                                </Button>

                                <Collapse in={showAddSheet}>
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '16px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}>
                                        <TextField
                                            label="Sheet Name"
                                            size="small"
                                            value={newSheet.name}
                                            onChange={(e) => setNewSheet({ ...newSheet, name: e.target.value })}
                                            fullWidth
                                            style={{ marginBottom: '16px' }}
                                            variant="outlined"
                                        />
                                        <TextField
                                            label="Sheet URL"
                                            size="small"
                                            value={newSheet.url}
                                            onChange={(e) => setNewSheet({ ...newSheet, url: e.target.value })}
                                            fullWidth
                                            style={{ marginBottom: '16px' }}
                                            variant="outlined"
                                        />
                                        <TextField
                                            label="Target Columns (comma-separated)"
                                            size="small"
                                            value={newSheet.targetColumns || ''}
                                            onChange={(e) => setNewSheet({ ...newSheet, targetColumns: e.target.value })}
                                            fullWidth
                                            style={{ marginBottom: '16px' }}
                                            variant="outlined"
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={addSheet}
                                            style={{
                                                backgroundColor: '#9B0F4A',
                                                color: 'white',
                                                width: '100%',
                                                padding: '12px 24px',
                                                borderRadius: '8px',
                                                textTransform: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            Add Sheet
                                        </Button>
                                    </div>
                                </Collapse>
                            </>
                        )}

                        {/* Scraping Button */}
                        <Button
                            variant="contained"
                            onClick={runScraping}
                            style={{
                                backgroundColor: '#9B0F4A',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                ':hover': {
                                    backgroundColor: '#800f3c',
                                    boxShadow: '0 4px 6px -1px rgba(155, 15, 74, 0.2)'
                                }
                            }}
                        >
                            Run Scraping
                        </Button>

                        {/* Filters Section */}
                        <div style={{
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            backgroundColor: '#ffffff'
                        }}>
                            <Typography variant="h6" style={{
                                marginBottom: '16px',
                                color: '#2d3436',
                                fontWeight: 600
                            }}>
                                Filters
                            </Typography>

                            <FormControl fullWidth>
                                <InputLabel style={{ color: '#9B0F4A' }}>Filter by Branch</InputLabel>
                                <Select
                                    multiple
                                    value={branchFilter}
                                    onChange={handleBranchChange}
                                    input={<OutlinedInput label="Filter by Branch" />}
                                    renderValue={(selected) => selected.join(', ')}
                                    style={{ backgroundColor: '#f8f9fa' }}
                                >
                                    {allBranches.map((branch) => (
                                        <MenuItem key={branch} value={branch}>
                                            <Checkbox
                                                checked={branchFilter.includes(branch)}
                                                style={{ color: '#9B0F4A' }}
                                            />
                                            <ListItemText
                                                primary={branch}
                                                primaryTypographyProps={{ style: { color: '#2d3436' } }}
                                            />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <div style={{ marginTop: '24px' }}>
                                <Typography variant="h6" style={{
                                    marginBottom: '16px',
                                    color: '#2d3436',
                                    fontWeight: 600
                                }}>
                                    Column Visibility
                                </Typography>
                                <FormGroup>
                                    {Object.keys(visibleColumns).map((column) => (
                                        <FormControlLabel
                                            key={column}
                                            control={
                                                <Checkbox
                                                    checked={visibleColumns[column]}
                                                    onChange={() => toggleColumnVisibility(column)}
                                                    style={{ color: '#9B0F4A' }}
                                                />
                                            }
                                            label={
                                                <Typography style={{ color: '#2d3436' }}>
                                                    {column}
                                                </Typography>
                                            }
                                            style={{ marginLeft: '-8px' }}
                                        />
                                    ))}
                                </FormGroup>
                            </div>
                        </div>
                    </div>
                </Collapse>
                <Typography variant="h6" style={{
                    margin: 0,
                    fontWeight: 600,
                    color: '#2d3436'
                }}>
                    Hackerrank
                </Typography>
            </div>

            <div style={{
                flex: 3,
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <Typography
                    variant='h3'
                    sx={{
                        mb: 4,
                        textAlign: 'center',
                        color: '#9B0F4A',
                        fontWeight: 700,
                        letterSpacing: '-0.05rem',
                        fontSize: '50%'
                    }}
                >
                    LEADERBOARD RANKING
                </Typography>
                <Leaderboard />
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        '& .MuiTable-root': {
                            borderCollapse: 'separate',
                            borderSpacing: '0 8px'
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                backgroundColor: '#9B0F4A',
                                '& th': {
                                    color: 'rgba(255,255,255,0.7)',
                                    '&:hover': { color: '#d0efff' },
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    padding: '16px 24px',
                                    '&:first-of-type': { borderTopLeftRadius: '8px' },
                                    '&:last-of-type': { borderTopRightRadius: '8px' }
                                }
                            }}>
                                {columnOrder.map((key) => visibleColumns[key] && (
                                    <TableCell key={key}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            {key}
                                            <div>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.7)',
                                                        '&:hover': { color: 'green' }
                                                    }}
                                                    onClick={() => sortLeaderboard(key, 'asc')}
                                                >
                                                    <ArrowUpward fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.7)',
                                                        '&:hover': { color: '#ff4444' }
                                                    }}
                                                    onClick={() => sortLeaderboard(key, 'desc')}
                                                >
                                                    <ArrowDownward fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredLeaderboard.map((entry, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 6px -1px rgba(155, 15, 74, 0.1)'
                                        },
                                        '& td': {
                                            padding: '16px 24px',
                                            borderBottom: '1px solid #f1f5f9',
                                            '&:first-of-type': { borderLeft: '3px solid #9B0F4A' }
                                        }
                                    }}
                                >
                                    {columnOrder.map((key) => visibleColumns[key] && (
                                        <TableCell key={key}>
                                            {key === 'Profile Image' ? (
                                                <img
                                                    src={entry.profileImage}
                                                    alt="profile"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: '2px solid #9B0F4A'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{
                                                    color: '#1e293b',
                                                    fontWeight: key === 'Total Score' ? 600 : 400
                                                }}>
                                                    {entry[key] || '-'}
                                                </span>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{
                        '& .MuiSnackbarContent-root': {
                            backgroundColor: '#9B0F4A',
                            color: 'white',
                            borderRadius: '8px'
                        }
                    }}
                    message={snackbarMessage}
                />
            </div>
        </div>
    );
};

export default LeaderboardComponent;