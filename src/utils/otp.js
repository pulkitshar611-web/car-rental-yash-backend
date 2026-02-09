const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

module.exports = { generateOTP, isExpired };
