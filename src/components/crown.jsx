import React, { useEffect, useState } from "react";
import axios from "axios";

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

    const sampleData = [
        { "Roll Number": 1, "Name of the student": "Alice Johnson", "Total Score": 95 },
        { "Roll Number": 2, "Name of the student": "Bob Smith", "Total Score": 90 },
        { "Roll Number": 3, "Name of the student": "Charlie Brown", "Total Score": 85 },
    ];

    const displayPlayers = players.length > 0 ? players : sampleData;

    return (
        <div className="flex justify-center items-end h-64 relative">
            {loading ? (
                <p>Loading...</p>
            ) : (
                displayPlayers.slice(0, 3).map((player, index) => {
                    let blockHeight = "h-24";
                    let blockWidth = "w-32";

                    const gradientColors = [
                        "linear-gradient(135deg, #FFB6C1, #FF69B4)", // 1st place
                        "linear-gradient(135deg, #ADD8E6, #87CEFA)", // 2nd place
                        "linear-gradient(135deg, #90EE90, #32CD32)", // 3rd place
                    ];

                    const blockStyle = { background: gradientColors[index] || "#FFFFFF" };

                    if (index === 0) blockHeight = "h-32";
                    if (index === 1) blockHeight = "h-28";
                    if (index === 2) blockHeight = "h-24";

                    return (
                        <div key={player["Roll Number"]} className="relative flex flex-col items-center mx-2">
                            {/* ✅ Crown Image Positioned Correctly */}
                            {index === 0 && (
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                                    <img src="./crown.png" alt="Crown" className="w-16 h-16" />
                                </div>
                            )}

                            {/* Player Block */}
                            <div className={`relative rounded-lg flex flex-col items-center justify-center ${blockHeight} ${blockWidth} transition-transform transform hover:scale-105`} style={blockStyle}>
                                <div className="text-white font-bold text-center">
                                    <span style={{ fontSize: "15px", lineHeight: "1.2" }}>
                                        {player["Name of the student"]}
                                    </span>
                                    <br />
                                    <span style={{ fontSize: "15px", lineHeight: "1.2" }}>
                                        {player["Total Score"]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Leaderboard;
