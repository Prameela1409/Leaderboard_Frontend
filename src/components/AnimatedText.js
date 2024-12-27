// // src/components/AnimatedText.js
// import React from 'react';
// import { Typography } from '@mui/material';
// import Typist from 'react-typist';
// import { useSpring, animated } from 'react-spring';

// const AnimatedText = () => {
//     const typingAnimation = useSpring({
//         opacity: 1,
//         from: { opacity: 0 },
//         config: { duration: 1500 },
//     });

//     return (
//         <animated.div style={typingAnimation}>
//             <Typography
//                 variant="h5"
//                 style={{
//                     marginBottom: '20px',
//                     textAlign: 'center',
//                     fontWeight: 'bold',
//                     fontFamily: 'Arial, sans-serif',
//                 }}
//             >
//                 <Typist avgTypingDelay={100} cursor={{ show: true, blink: true }}>
//                     <span style={{ color: 'red' }}>See your performance... </span>
//                     <span style={{ color: 'blue' }}>Boost your </span>
//                     <span style={{ color: 'green' }}>competitive spirit... </span>
//                     <span style={{ color: 'purple' }}>Do it!</span>
//                 </Typist>
//             </Typography>
//         </animated.div>
//     );
// };

// export default AnimatedText;
