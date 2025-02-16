import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import './styles.css';
import { AuthContext } from './AuthContext';
import LottieAnimation from './LottieAnimation';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Snackbar,
} from '@mui/material';

const LeaderboardApp = () => {
    const [sheets, setSheets] = useState([]);
    const { logout, isLogin } = useContext(AuthContext);
    const [leaderboard, setLeaderboard] = useState([]);
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
    const audioRef = useRef(null);
    const [blastAnimation, setBlastAnimation] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    const playBlastSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
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

    return (
        <>
            <audio ref={audioRef} src="/blastmusic.mp3" preload="auto" />
            <div className={`blast-background ${blastAnimation ? 'blast-animation' : ''}`}></div>
            <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                <div style={{ backgroundColor: '#000000' }}>
                    <AppBar position="static" style={{ marginBottom: '20px' }}>
                        <Toolbar>
                            <img
                                src="https://th.bing.com/th/id/OIP.1VsevbVhxjiXu5IHXFIkSgAAAA?rs=1&pid=ImgDetMain"
                                alt="Logo"
                                style={{ marginRight: '10px', borderRadius: '50%' }}
                                width="50"
                                height="50"
                            />
                            <Typography variant="h6" style={{ flexGrow: 1, color: 'white', fontWeight: 'bolder' }}>
                                Vishnu Institute of Technology
                            </Typography>
                            <div style={{ padding: '10px', textAlign: 'center', color: 'black' }}>
                                {isLogin ? (
                                    <motion.button
                                        onClick={handleLogout}
                                        style={{
                                            backgroundColor: '#9B0F4A',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.3s',
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: '0 0 10px #9B0F4A, 0 0 20px #9B0F4A, 0 0 30px #9B0F4A',
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Logout
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={() => navigate('login')}
                                        style={{
                                            backgroundColor: '#9B0F4A',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.3s',
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: '0 0 10px #9B0F4A, 0 0 20px #9B0F4A, 0 0 30px #9B0F4A',
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Login
                                    </motion.button>
                                )}
                            </div>
                        </Toolbar>
                    </AppBar>
                </div>
                <div className={`container ${blastAnimation ? 'blast-animation' : ''}`} style={{ marginTop: "-20px", flex: 1, position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: -1,
                        overflow: "hidden",
                        perspective: "1000px",
                    }}>
                        <div style={{
                            transform: "rotateY(10deg)",
                            transition: "transform 0.5s ease-in-out",
                        }}>
                            <LottieAnimation
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                    </div>

                    <div
                        className="incontainer"
                        style={{
                            height: '8%',
                            width: '40%',
                            position: "relative",
                            zIndex: 1,
                            padding: "20px",
                            textAlign: "center",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                            borderRadius: "10px",
                            background: "rgba(255, 255, 255, 0.8)",
                            transition: "transform 0.3s ease",
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{
                                opacity: 1,
                                y: [0, -10, 0, 10, 0],
                                color: ["#B2412D ", "#8C1D04", "#12674A", "#0A4C76", "#7A1B50", "#000000"]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{
                                fontSize: "60px",
                                fontWeight: "bold",
                                fontFamily: "'Lavishly Yours', cursive",
                            }}
                        >
                            Achieve More, Lead the Way!
                        </motion.h1>

                        <p style={{ color: 'black', fontSize: "20px", fontFamily: "'LSour ', serif", margin: '0px' }}>
                            Celebrate achievements, track your progress, and rise to the top.<br />
                            Join the journey to success with the <br /> Vishnu College Leaderboard!
                        </p>

                        <div className="flex justify-center items-center h-screen bg-[#0a0e1a]">
                            <motion.button
                                className="text-white text-lg font-semibold px-6 py-3 rounded-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    navigate('leaderboardcomponent');
                                    playBlastSound();
                                }}
                                style={{
                                    backgroundColor: '#9B0F4A',
                                    color: 'white',
                                    margin: '20px',
                                    padding: "10px 20px",
                                    borderRadius: "5px",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "background-color 0.3s, transform 0.2s, box-shadow 0.3s",
                                    boxShadow: "none",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#D5006D';
                                    e.currentTarget.style.boxShadow = "0 0 10px #D5006D, 0 0 20px #D5006D, 0 0 30px #D5006D";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9B0F4A';
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                View Leaderboard
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </>
    );
};

export default LeaderboardApp;