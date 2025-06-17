const getTicket = async (req, res, next) => {
    return res.status(200).json({ message: "/getTicket" });
};

const getAllTickets = async (req, res, next) => {
    return res.status(200).json({ message: "/getAllTicket" });
};

const createTicket = async (req, res, next) => {
    return res.status(200).json({ message: "/createTicket" });
};

const updateTicket = async (req, res, next) => {
    return res.status(200).json({ message: "/updateTicket" });
};

const removeTicket = async (req, res, next) => {
    return res.status(200).json({ message: "/removeTicket" });
};

const removeTickets = async (req, res, next) => {
    return res.status(200).json({ message: "/removeTickets" });
};

export { getTicket, getAllTickets, createTicket, updateTicket, removeTicket, removeTickets };
