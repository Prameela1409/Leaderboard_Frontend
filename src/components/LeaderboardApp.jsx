import React, { useState, useMemo } from 'react';
import axios from 'axios';

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Menu,
    MenuItem,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    FormGroup,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    ListItemText,
    Snackbar,
    colors,
} from '@mui/material';
import { ArrowDownward, ArrowUpward, CenterFocusStrong } from '@mui/icons-material';

const LeaderboardApp = () => {
    const [sheets, setSheets] = useState([
        { name: '2025 Placements', url: 'https://docs.google.com/spreadsheets/d/1TU8BmZ41QTWSu8knMkUmEslOzwmDskRbp8zoVtprAkw/edit?usp=sharing', selected: false },
        { name: '2026 Placements', url: 'https://docs.google.com/spreadsheets/d/1iVGo--w7ZVlXmEr8PPrsG0qYlVZB86smu3sN_PW16Y4/edit?usp=sharing', selected: false },
    ]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isAdmin, setIsAdmin] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [newSheet, setNewSheet] = useState({ name: '', url: '' });
    const [branchFilter, setBranchFilter] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState({
        'Hackerrank Scores': true,
        'Leetcode Scores': true,
        'Total Score': true,
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [showAddSheet, setShowAddSheet] = useState(false);  // Track the Add Sheet button click

    const allBranches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'AIDS'];

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 48 * 4.5 + 8,
                width: 250,
            },
        },
    };

    const handleBranchChange = (event) => {
        const { target: { value } } = event;
        setBranchFilter(typeof value === 'string' ? value.split(',') : value);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
    };

    const toggleSheetSelection = (index) => {
        const updatedSheets = [...sheets];
        updatedSheets[index].selected = !updatedSheets[index].selected;
        setSheets(updatedSheets);
    };

    const addSheet = () => {
        if (newSheet.name && newSheet.url) {
            setSheets([...sheets, { name: newSheet.name, url: newSheet.url, selected: false }]);
            setNewSheet({ name: '', url: '' });
            setSnackbarMessage('Sheet Added Successfully!');
            setOpenSnackbar(true);
            setShowAddSheet(false); // Hide the input fields after adding the sheet
        }
    };

    const runScraping = async () => {
        const selectedSheets = sheets.filter(sheet => sheet.selected).map(sheet => sheet.url);
        try {
            const response = await axios.post('http://127.0.0.1:5000/scrape', { sheet_urls: selectedSheets });
            if (response.data && Array.isArray(response.data)) {
                setLeaderboard(response.data);
            } else {
                console.error('Invalid response data:', response.data);
            }
        } catch (error) {
            console.error('Error scraping data:', error);
            setSnackbarMessage('Error while scraping data');
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

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* App Bar */}
            <AppBar position="static" style={{ marginBottom: '20px' }}>
                <Toolbar>
                    <img 
                        src="https://play-lh.googleusercontent.com/ltjak6wyekUfzFGPi7hs5AHyApkJbHXylN-Woc7zBZmq9pfZcRzPGKtic_HMIZZKZdE" // Replace this URL with your logo image URL
                        alt="Logo" 
                        style={{ marginRight: '10px', borderRadius: '50%' }}
                        width="40"
                        height="40"
                    />
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Vishnu Placement Cell
                    </Typography>
                    <Button color="inherit" onClick={() => alert('You clicked on Login')}>
                        Login
                    </Button>
                </Toolbar>
            </AppBar>

            <div style={{ display: 'flex', padding: '20px' }}>
                {/* Left Sidebar for Sheet Selection */}
                <div style={{ width: '250px', padding: '20px', borderRight: '1px solid #ccc' }}>
                    <Typography variant="h6" style={{ marginBottom: '20px' }}>
                        Google Sheets Selection
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleMenuClick}
                        style={{ marginBottom: '10px' }}
                    >
                        Select Sheets
                    </Button>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        {sheets.map((sheet, index) => (
                            <MenuItem key={index}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={sheet.selected}
                                            onChange={() => toggleSheetSelection(index)}
                                        />
                                    }
                                    label={sheet.name}
                                />
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Only show the Add Sheet form if showAddSheet is true */}
                    {isAdmin && (
                        <>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setShowAddSheet(!showAddSheet)}
                                style={{ marginTop: '8px' }}
                            >
                                {showAddSheet ? 'Cancel' : 'Add Sheet'}
                            </Button>

                            {/* Conditionally render input fields */}
                            {showAddSheet && (
                                <div style={{ marginTop: '20px' }}>
                                    <TextField
                                        label="Sheet Name"
                                        size="small"
                                        value={newSheet.name}
                                        onChange={(e) => setNewSheet({ ...newSheet, name: e.target.value })}
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <TextField
                                        label="Sheet URL"
                                        size="small"
                                        value={newSheet.url}
                                        onChange={(e) => setNewSheet({ ...newSheet, url: e.target.value })}
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <Button variant="outlined" color="success" onClick={addSheet}>
                                        Add Sheet
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={runScraping}
                        style={{ marginTop: '20px' }}
                    >
                        Run Scraping
                    </Button>
        <div style={{ width: '250px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', marginTop : '10px'}}>
            <Typography variant="h6" style={{ marginBottom: '10px' }}>Filters</Typography>
            
            {/* Branch Filter */}
            <FormControl style={{ minWidth: 200 }}>
                <InputLabel>Filter by Branch</InputLabel>
                <Select
                    multiple
                    value={branchFilter}
                    onChange={handleBranchChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {allBranches.map((branch) => (
                        <MenuItem key={branch} value={branch}>
                            <Checkbox checked={branchFilter.indexOf(branch) > -1} />
                            <ListItemText primary={branch} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Column Visibility */}
            <div style={{ marginTop: '20px' }}>
                <Typography variant="h6" style={{ marginBottom: '10px' }}>Column Visibility</Typography>
                <FormGroup>
                    {Object.keys(visibleColumns).map((column) => (
                        <FormControlLabel
                            key={column}
                            control={
                                <Checkbox
                                    checked={visibleColumns[column]}
                                    onChange={() => toggleColumnVisibility(column)}
                                />
                            }
                            label={column}
                        />
                    ))}
                </FormGroup>
            </div>
        </div>
                </div>

                {/* Right Content Area for Filters */}
                <div style={{ flex: 1, padding: '20px' }}>
                   
                    <Typography variant = 'h5' style={{
                        marginBottom: '20px', textAlign: 'center'
                    }}>
                        Leaderboard
                    </Typography>
            

                    <TableContainer component={Paper} style={{ margin: '0 auto', maxWidth: '800px' }}>
                        <Table>
                            <TableHead style={{ backgroundColor: '#3f51b5' }}>
                                <TableRow>
                                    <TableCell style={{ color: '#fff' }}>Roll Number</TableCell>
                                    <TableCell style={{ color: '#fff' }}>Name of the student</TableCell>
                                    <TableCell style={{ color: '#fff' }}>Branch</TableCell>
                                    {Object.entries(visibleColumns)
                                        .filter(([, visible]) => visible)
                                        .map(([column]) => (
                                            <TableCell key={column} style={{ color: '#fff' }}>
                                                {column}
                                                <div>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => sortLeaderboard(column, 'asc')}
                                                    >
                                                        <ArrowUpward />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => sortLeaderboard(column, 'desc')}
                                                    >
                                                        <ArrowDownward />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
    {filteredLeaderboard.map((entry, index) => {
        // Alternate row background color
        const rowStyle = {
            backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#fffff8' // Light gray for even rows and white for odd rows
        };

        return (
            <TableRow key={index} style={rowStyle}>
                <TableCell>{entry['Roll Number']}</TableCell>
                <TableCell>{entry['Name of the student']}</TableCell>
                <TableCell>{entry['Branch']}</TableCell>
                {Object.entries(visibleColumns)
                    .filter(([, visible]) => visible)
                    .map(([column]) => (
                        <TableCell key={column}>{entry[column]}</TableCell>
                    ))}
            </TableRow>
        );
    })}
</TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>

            {/* Snackbar */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </div>
    );
};

export default LeaderboardApp;
