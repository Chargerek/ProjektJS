/**
 * Middleware do sprawdzania uprawnień administratora
 */
function adminOnly(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            error: 'Brak dostępu',
            message: 'Ta operacja wymaga uprawnień administratora'
        });
    }
    next();
}

module.exports = { adminOnly };
