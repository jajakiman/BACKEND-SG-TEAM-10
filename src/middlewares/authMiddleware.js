import jwt from "jsonwebtoken";

// Middleware autentikasi JWT
const authMiddleware = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ success: false, message: "No token provided" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ success: false, message: "Invalid token" });
	}
};

export default authMiddleware;
