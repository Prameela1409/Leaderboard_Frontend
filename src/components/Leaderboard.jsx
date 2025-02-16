import React, { useEffect, useState } from "react";
import axios from "axios";
import { LiaCrownSolid } from "react-icons/lia"; // Import crown icon
import "./styles.css";

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/getLeaderboard");
                setPlayers(response.data);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Sample data (used if API fails or no data is available)
    const sampleData = [
        { "Roll Number": 1, "Name of the student": "Alice Johnson", "Total Score": 95 },
        { "Roll Number": 2, "Name of the student": "Bob Smith", "Total Score": 90 },
        { "Roll Number": 3, "Name of the student": "Charlie Brown", "Total Score": 85 },
    ];

    // Use API data if available; otherwise, fallback to sampleData
    const displayPlayers = players.length > 0 ? players : sampleData;

    return (
        <div className="text-center relative bg-gradient-to-r from-blue-500 to-purple-500 min-h-screen p-5">
            {loading ? (
                <p className="text-white text-2xl">Loading...</p>
            ) : (
                <div className="flex justify-center items-end h-48">
                    {displayPlayers.slice(0, 3).map((player, index) => {
                        let blockHeight = "h-24"; // Default height
                        let blockWidth = "w-32"; // Default width

                        const gradientColors = [
                            "linear-gradient(135deg, #FFB6C1, #FF69B4)", // 1st place (Pink)
                            "linear-gradient(135deg, #ADD8E6, #87CEFA)", // 2nd place (Blue)
                            "linear-gradient(135deg, #90EE90, #32CD32)", // 3rd place (Green)
                        ];

                        const blockStyle = { background: gradientColors[index] };

                        if (index === 0) blockHeight = "h-32"; // First place tallest
                        if (index === 1) blockHeight = "h-28"; // Second place
                        if (index === 2) blockHeight = "h-24"; // Third place

                        return (
                            <div key={player["Roll Number"]} className="relative flex flex-col items-center mx-2">
                                {/* Fixed Crown - Always Above 1st Place */}
                                {index === 0 && (
                                    <div className="absolute -top-8 text-yellow-500 text-20xl">
                                        <LiaCrownSolid className="abs" />
                                    </div>
                                )}

                                {/* Player Block */}
                                <div
                                    className={`rounded-lg flex flex-col items-center justify-center ${blockHeight} ${blockWidth} transition-transform transform hover:scale-110 shadow-lg`}
                                    style={blockStyle}
                                >
                                    <div className="text-white font-bold text-center">
                                        <span className="text-lg">{player["Name of the student"]}</span>
                                        <br />
                                        <span className="text-lg">{player["Total Score"]}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
