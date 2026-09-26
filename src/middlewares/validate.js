const validate = (schema) => (req, res, next) => {
    // Combine params, query, and body to validate everything together
    const dataToValidate = { ...req.params, ...req.query, ...req.body };
    const { error, value } = schema.validate(dataToValidate);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    // Assign back to req.body so the controller can easily access all validated data
    req.body = value;
    next();
};

module.exports = validate;
