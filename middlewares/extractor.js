const sortAndPagination = (req, res, next) => {
    const { query } = req;
    if (query) {
        req.sort = {
            sortBy: query.sortBy || 'createdAt',
            sortOrder: query.sortOrder || 'DESC'
        };

        req.pagination = {
            skip : query.skip ? parseInt(query.skip) :  0,
            limit : query.limit ? parseInt(query.limit) :  Number.MAX_SAFE_INTEGER
        };

        delete query.sortBy;
        delete query.sortOrder;
        delete query.skip;
        delete query.limit;
    }

    next();
};

module.exports = {
    sortAndPagination
};