export const buildTransactionFilter = (query: any) => {
    const { status, type, fromDate, toDate } = query;
    const filter: any = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (fromDate) filter.transactionDate = { $gte: new Date(fromDate as string) };
    if (toDate) filter.transactionDate = { ...filter.transactionDate, $lte: new Date(toDate as string) };

    return filter;
};

export const handlePagination = (query:any) => {
    const { page = 1, limit = 3 } = query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    return { skip, limit: parseInt(limit as string) };
};