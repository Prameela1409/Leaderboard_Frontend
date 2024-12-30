import React, { useState, useMemo,useEffect , useContext} from 'react';
import axios from 'axios';
import Login from './Login';
import { AuthContext } from './AuthContext';

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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { ArrowDownward, ArrowUpward, CenterFocusStrong, ResetTvSharp } from '@mui/icons-material';

const LeaderboardApp = () => {
    const [sheets, setSheets] = useState([
       
    ]);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleLoginOpen = () => {
        setShowLoginDialog(true);
    };

    const handleLoginClose = () => {
        setShowLoginDialog(false);
    };
    const { logout } = useContext(AuthContext);
    const { isAdmin, isLogin } = useContext(AuthContext);
    const [leaderboard, setLeaderboard] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [newSheet, setNewSheet] = useState({ name: '', url: '' });
    const [branchFilter, setBranchFilter] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState({
        'Roll Number': true,
        'Name of the student': true,
        'Branch': true,
    });
    const initialColumnOrder = [
        "Roll Number",
        "Name of the student",
        "Branch",
        "Total Score"
    ];
    const [columnOrder, setColumnOrder] = useState(initialColumnOrder);
    const [showLogin, setShowLogin] = useState(false);
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
    
    
    // Fetch last scraped data when component mounts (or if no sheet is selected)
    useEffect(() => {
        console.log('Sheets:', sheets);  // Log sheets to check its value

        const fetchLastScrapedData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/getLeaderboard');
                console.log('API Response:', response.data);  // Log API response
                if (response.data && Array.isArray(response.data)) {
                    const keys = Object.keys(response.data[0]);

                    // Ensure Roll Number, Name, Branch are at the start, Total Score at the end
                    const predefinedColumns = ["Roll Number", "Name of the student", "Branch", "Total Score"];
                    const otherColumns = keys.filter(
                        key => !predefinedColumns.includes(key)
                    );

                    // Combine in desired order
                    const updatedColumnOrder = [
                        "Roll Number",
                        "Name of the student",
                        "Branch",
                        ...otherColumns,
                        "Total Score"
                    ];
                    // Update visibility for each column
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

        // If no sheet is selected, automatically load the last scraped data
        if (sheets.every(sheet => !sheet.selected)) {
            fetchLastScrapedData();
        }

    }, [sheets]);
    
    const handleBranchChange = (event) => {
        const { target: { value } } = event;
        setBranchFilter(typeof value === 'string' ? value.split(',') : value);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleLogout = () => {
        // Add logic for logging out, e.g., clearing session/cookies or updating state
        logout()
        console.log('Logging out...');
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],  // Toggle the visibility of the column
        }));
    };

    const toggleSheetSelection = (index) => {
        // Create a copy of the sheets array
        const updatedSheets = [...sheets];
    
        // Toggle the selected state for the specific index
        updatedSheets[index].selected = !updatedSheets[index].selected;
    
        // Update the sheets state immediately
        setSheets(updatedSheets);
    
        // Log the data being sent to the server for debugging
        console.log({
            sheetId: updatedSheets[index]._id,
            isSelected: updatedSheets[index].selected,
        });
    
        // Send the updated data to the server
        // axios.post('http://127.0.0.1:5000/api/sheets/update', {
        //     sheetId: updatedSheets[index]._id,
        //     isSelected: updatedSheets[index].selected,
        // }).catch((error) => {
        //     console.error("Error updating sheet:", error.response?.data || error.message);
    
        //     // Revert the state change if the API call fails
        //     const revertedSheets = [...sheets];
        //     revertedSheets[index].selected = !revertedSheets[index].selected;
        //     setSheets(revertedSheets);
        // });
    };
    
    
    
    
    //   const finishScraping = async (sheetId) => {
    //     // Update isSelected to false after scraping is done
    //     await axios.post('http://127.0.0.1:5000/api/sheets/update', {
    //       sheetId: sheetId,
    //       isSelected: false,
    //     });
    //   };

    const addSheet = async () => {
        // Ensure that targetColumns is an array by splitting the string (if it's a comma-separated value)
        const formattedTargetColumns = newSheet.targetColumns
            ? newSheet.targetColumns.split(',').map(item => item.trim()) // Split by commas and remove extra spaces
            : [];


            
    
        // Update newSheet with the formatted targetColumns
        const sheetData = {
            ...newSheet,
            targetColumns: formattedTargetColumns
        };
    
        if (newSheet.name && newSheet.url && sheetData.targetColumns.length > 0) {
            try {
                const response = await axios.post('http://127.0.0.1:5000/addSheet', sheetData);
                setColumnOrder(response.data.sheet.columnOrder);
                setSheets([...sheets, { ...response.data.sheet, selected: false }]);
                setNewSheet({ name: '', url: '', targetColumns: '' }); // Reset the targetColumns input to an empty string
                setSnackbarMessage('Sheet Added Successfully!');
                setOpenSnackbar(true);
                setShowAddSheet(false);
            } catch (error) {
                console.error('Error adding sheet:', error);
                setSnackbarMessage('Error adding sheet');
                setOpenSnackbar(true);
            }
        } else {
            setSnackbarMessage('Please provide a name, URL, and at least one target column.');
            setOpenSnackbar(true);
        }
    };
    
    
    

    const runScraping = async () => {
        // Get IDs of selected sheets
        const selectedSheetIds = sheets
            .filter(sheet => sheet.selected)
            .map(sheet => sheet._id);
    
        console.log('Selected Sheets:', selectedSheetIds);
    
        // Check if any sheets are selected
        if (selectedSheetIds.length === 0) {
            setSnackbarMessage('No sheets selected for scraping');
            setOpenSnackbar(true);
            return;
        }
    
        try {
            // Send selected sheet IDs to the backend for scraping
            const response = await axios.post('http://127.0.0.1:5000/scrape', { sheet_ids: selectedSheetIds });
    
            // Validate the response and update leaderboard
            if (response.data && Array.isArray(response.data)) {
                setLeaderboard(response.data); // Update leaderboard state
                const keys = Object.keys(response.data[0]);

                    // Ensure Roll Number, Name, Branch are at the start, Total Score at the end
                    const predefinedColumns = ["Roll Number", "Name of the student", "Branch", "Total Score"];
                    const otherColumns = keys.filter(
                        key => !predefinedColumns.includes(key)
                    );

                    // Combine in desired order
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
                    setVisibleColumns(updatedVisibleColumns)
                    setColumnOrder(updatedColumnOrder);
                setSnackbarMessage('Scraping completed successfully');
                setOpenSnackbar(true);
            } else {
                console.error('Invalid response data:', response.data);
                setSnackbarMessage('Invalid data received from the server');
                setOpenSnackbar(true);
            }
        } catch (error) {
            // Log error and display user-friendly message
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
                    {/* Conditionally render Login/Logout button based on isAdmin and isLogin */}
                    {isAdmin || isLogin ? (
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    ) : (
                        <Button color="inherit" onClick={handleLoginOpen}>
                            Login
                        </Button>
                    )}
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
                                    <TextField
                                        label="Target Columns (comma-separated)"
                                        size="small"
                                        value={newSheet.targetColumns || ''}
                                        onChange={(e) => setNewSheet({ ...newSheet, targetColumns: e.target.value })}
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
                <div style={{ flex: 3, padding: '20px' }}>
                <Dialog open={showLoginDialog} onClose={handleLoginClose}>
                    
                    <DialogContent>
                        <Login />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleLoginClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                    <Typography variant = 'h5' style={{
                        marginBottom: '20px', textAlign: 'center'
                    }}>
                        Leaderboard
                    </Typography>
            



<TableContainer component={Paper} style={{ margin: '0 auto', maxWidth: '800px' }}>
    <Table>
        <TableHead style={{ backgroundColor: '#3f51b5' }}>
        <TableRow>
    {columnOrder.map((key) => {
        // Skip rendering sort buttons for 'Roll Number', 'Name of the student', 'Branch'
        if (visibleColumns[key] && !["Roll Number", "Name of the student", "Branch"].includes(key)) {
            return (
                <TableCell key={key} style={{ color: '#fff' }}>
                    {key}
                    {/* Add sort buttons only for sortable columns */}
                    <div>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => sortLeaderboard(key, 'asc')}
                        >
                            <ArrowUpward />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => sortLeaderboard(key, 'desc')}
                        >
                            <ArrowDownward style={{ color: '#FF0000' }} />
                        </IconButton>
                    </div>
                </TableCell>
            );
        }

        // If the column is visible but doesn't need sorting buttons (like "Roll Number", "Name", "Branch")
        if (visibleColumns[key]) {
            return (
                <TableCell key={key} style={{ color: '#fff' }}>
                    {key}
                </TableCell>
            );
        }

        // If the column is not visible, return null (nothing rendered)
        return null;
    })}
</TableRow>


        </TableHead>
        <TableBody>
    {filteredLeaderboard.map((entry, index) => {
        // Alternate row background color
        const rowStyle = {
            backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#fffff8', // Light gray for even rows and white for odd rows
        };

        return (
            <TableRow key={index} style={rowStyle}>
                {/* Render data in the defined column order */}
                {columnOrder.map((key) => {
                    // Only render the cell if the column is visible
                    if (visibleColumns[key]) {
                        return (
                            <TableCell key={key}>
                                {entry[key] || ''} {/* Use empty string for missing values */}
                            </TableCell>
                        );
                    }
                    return null;  // If the column is not visible, return null
                })}
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
