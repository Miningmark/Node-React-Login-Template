const getAllUsers = async (req, res, next) => {
    try {
        return res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};

export { getAllUsers };
