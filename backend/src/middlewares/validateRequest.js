const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    return res.status(400).json({ success: false, error: message });
  }
  req.validated = result.data;
  next();
};

export default validateRequest;
