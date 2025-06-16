const test1 = async (req, res, next) => {
    try {
        return res.status(200).json({ message: "test1" });
    } catch (error) {
        next(error);
    }
};

const test2 = async (req, res, next) => {
    try {
        return res.status(200).json({ message: "test2" });
    } catch (error) {
        next(error);
    }
};

export { test1, test2 };
