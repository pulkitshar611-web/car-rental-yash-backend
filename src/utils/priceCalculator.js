const lateFeeMultiplier = 1.5;

const calculateRentalPrice = (startDate, endDate, dailyRate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        throw new Error('End date must be after start date');
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (diffDays * dailyRate).toFixed(2);
};

const calculateLateFee = (actualReturnDate, expectedEndDate, dailyRate) => {
    const actual = new Date(actualReturnDate);
    const expected = new Date(expectedEndDate);

    if (actual <= expected) return 0;

    const diffTime = Math.abs(actual - expected);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (diffDays * dailyRate * lateFeeMultiplier).toFixed(2);
};

module.exports = { calculateRentalPrice, calculateLateFee };
