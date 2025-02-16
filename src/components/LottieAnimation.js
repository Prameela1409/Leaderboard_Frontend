import React from "react";
import Lottie from "lottie-react";
import animationData from "./Animation - 1739419855268.json"; // Use a relative path to your Lottie file

const LottieAnimation = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <Lottie animationData={animationData} loop={true} className="w-60 h-60" />
        </div>
    );
};

export default LottieAnimation;