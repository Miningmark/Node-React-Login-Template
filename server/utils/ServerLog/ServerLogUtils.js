import { Op } from "sequelize";

export function buildServerLogWhereClause(userIds, levels, ipv4Address, timestampFrom, timestampTo, searchString) {
    const where = { [Op.and]: [] };

    if (userIds !== undefined && Array.isArray(userIds)) {
        const orConditions = [];

        if (userIds.length > 0) orConditions.push({ userId: { [Op.in]: userIds } });
        if (userIds.includes(null)) orConditions.push({ userId: null });

        if (orConditions.length === 1) {
            where[Op.and].push(orConditions[0]);
        } else if (orConditions.length > 1) {
            where[Op.and].push({ [Op.or]: orConditions });
        }
    }

    if (levels !== undefined && Array.isArray(levels)) {
        if (levels.length === 1) where[Op.and].push({ level: levels[0] });
        if (levels.length > 1) where[Op.and].push({ level: { [Op.in]: levels } });
    }

    if (ipv4Address !== undefined) {
        where[Op.and].push({ ipv4Address: { [Op.like]: `%${ipv4Address}%` } });
    }

    if (timestampFrom !== undefined && !isNaN(new Date(timestampFrom).getTime())) {
        where[Op.and].push({ timestamp: { [Op.gte]: new Date(timestampFrom) } });
    }
    if (timestampTo !== undefined && !isNaN(new Date(timestampTo).getTime())) {
        where[Op.and].push({ timestamp: { [Op.lte]: new Date(timestampTo) } });
    }

    if (searchString !== undefined) {
        const searchFilter = `%${searchString}%`;
        where[Op.and].push({
            [Op.or]: [
                { message: { [Op.like]: searchFilter } },
                { url: { [Op.like]: searchFilter } },
                { method: { [Op.like]: searchFilter } },
                { status: { [Op.like]: searchFilter } },
                { userAgent: { [Op.like]: searchFilter } }
            ]
        });
    }

    return where;
}
