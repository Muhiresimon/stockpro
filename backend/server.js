const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = 'mysecretkey';
const PORT = 3000;

// 1. DATABASE CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "school" 
});

db.connect((err) => {
    if(err) console.log("MySQL Connection Failed", err);
    else console.log("MySQL Connected!");
});

// 2. MIDDLEWARE: SECURITY CHECK
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "Access Denied" });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid Token" });
        req.userId = decoded.id; 
        next(); 
    });
};

// --- AUTH ROUTES ---
app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ error: "Signup failed" });
        res.status(201).json({ message: "User created" });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ error: "User not found" });
        const user = result[0];
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: "Wrong password" });
        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1d' });
        res.json({ token, user });
    });
});

// --- DASHBOARD ANALYTICS ROUTE ---
app.get("/dashboard-stats", verifyToken, (req, res) => {
    const userId = req.userId;

    // Queries to aggregate stock data
    const stockInSql = "SELECT SUM(quantity) as totalIn FROM products WHERE user_id = ?";
    const stockOutSql = "SELECT SUM(quantity_removed) as totalOut FROM stock_out_logs WHERE user_id = ?";
    const activitySql = `
        SELECT l.*, p.name 
        FROM stock_out_logs l 
        JOIN products p ON l.product_id = p.id 
        WHERE l.user_id = ? 
        ORDER BY l.removed_at DESC LIMIT 5`;

    db.query(stockInSql, [userId], (err, inResult) => {
        if (err) return res.status(500).json({ error: "Error fetching stock in" });
        
        db.query(stockOutSql, [userId], (err, outResult) => {
            if (err) return res.status(500).json({ error: "Error fetching stock out" });
            
            db.query(activitySql, [userId], (err, activity) => {
                if (err) return res.status(500).json({ error: "Error fetching activity" });
                
                // CRITICAL: Convert potential NULL/Strings to Numbers for React
                res.json({
                    totalStockIn: Number(inResult[0].totalIn) || 0,
                    totalStockOut: Number(outResult[0].totalOut) || 0,
                    recentActivity: activity
                });
            });
        });
    });
});

// --- PRODUCT MANAGEMENT ROUTES ---

app.get("/products", verifyToken, (req, res) => {
    db.query("SELECT * FROM products WHERE user_id = ?", [req.userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Fetch failed" });
        res.json(results);
    });
});

app.post("/products", verifyToken, (req, res) => {
    const { name, quantity } = req.body;
    db.query("INSERT INTO products (name, quantity, user_id) VALUES (?, ?, ?)", [name, quantity, req.userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Save failed" });
        res.status(201).json({ message: "Saved", id: result.insertId });
    });
});

app.put("/products/:id", verifyToken, (req, res) => {
    const { name, quantity } = req.body;
    const sql = "UPDATE products SET name = ?, quantity = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [name, Number(quantity), req.params.id, req.userId], (err) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({ message: "Updated" });
    });
});

app.delete("/products/:id", verifyToken, (req, res) => {
    db.query("DELETE FROM products WHERE id = ? AND user_id = ?", [req.params.id, req.userId], (err) => {
        if (err) return res.status(500).json({ error: "Delete failed" });
        res.json({ message: "Deleted" });
    });
});

// --- STOCK OUT TRANSACTION ---
app.post("/products/stock-out", verifyToken, (req, res) => {
    const { productId, amountToRemove } = req.body;
    const userId = req.userId;

    // Validate that amountToRemove is a positive number
    if (!amountToRemove || amountToRemove <= 0) {
        return res.status(400).json({ error: "Please provide a valid amount to remove." });
    }

    db.query("SELECT * FROM products WHERE id = ? AND user_id = ?", [productId, userId], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ error: "Product not found" });

        const product = result[0];
        if (product.quantity < amountToRemove) {
            return res.status(400).json({ error: "Insufficient stock level!" });
        }

        const newQuantity = product.quantity - amountToRemove;

        db.query("UPDATE products SET quantity = ? WHERE id = ?", [newQuantity, productId], (err) => {
            if (err) return res.status(500).json({ error: "Update failed" });

            const logSql = "INSERT INTO stock_out_logs (product_id, user_id, quantity_removed) VALUES (?, ?, ?)";
            db.query(logSql, [productId, userId, amountToRemove], (err) => {
                if (err) return res.status(500).json({ error: "Logging failed" });
                res.json({ message: `Successfully removed ${amountToRemove} items.`, newQuantity });
            });
        });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

