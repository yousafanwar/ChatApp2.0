const authenticateUser = async (req, res, next) => {
    const authHeaders = req.headers.authorization;

    const token = authHeaders && authHeaders.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    const response = await fetch('http://auth-service:5002/api/auth/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    })
    const result = await response.json();
    console.log({ status: "authenticateUser hit", token, 'result': result });
    if (result.success) {
        next();
    } else {
        res.status(401).json({ error: "Authentication failed" });
    }
};

export default authenticateUser;