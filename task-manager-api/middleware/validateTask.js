const validateTaskInput = (req, res, next) => {

    // Validation is required for POST and PUT
    if (['POST', 'PUT'].includes(req.method)) {

        const { title } = req.body;

        if (
            title === undefined ||
            title === null ||
            typeof title !== 'string' ||
            title.trim() === ''
        ) {

            return res.status(400).json({
                error: 'Validation failed',
                message: 'Task title is required'
            });
        }

        // Sanitize title
        req.body.title = title.trim();
    }

    next();
};

module.exports = validateTaskInput;