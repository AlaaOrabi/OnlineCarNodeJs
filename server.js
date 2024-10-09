const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path'); 
const app = express();
const PORT = process.env.PORT || 8080;
const cors=require('cors');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors ({origin: '*'}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'onlinecar'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'login.html'));
});

/*app.post('/login', function(req, res) {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (error) {
            return res.status(500).send('Error while logging in');
        }
        if (results.length === 1) {
            req.session.user = { username, role: results[0].role };
            return res.redirect('/home.html');
        } 
    });
});*/
app.post('/login', function(req, res) {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (error) {
            return res.status(500).send('Error while logging in');
        }
        if (results.length === 1) {
            const user = results[0];
            req.session.user = { username: user.username, role: user.role };
            if (user.role === 'admin') {
                return res.redirect('/manage_product.html');
            } else {
                return res.redirect('/home.html');
            }
        } else {
            return res.status(401).send('Invalid username or password');
        }
    });
});

app.get('/manage_product.html', function(req, res) {
    if (req.session.user && req.session.user.role === 'admin') {
        res.sendFile(path.join(__dirname, 'manage_product.html'));
    } else {
        res.redirect('/'); // Redirect to login page if not logged in as admin
    }
});

/*app.get('/home.html', function(req, res) {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'home.html')); 
    } else {
        res.redirect('/');
    }
});*/
app.get('/getUsername', function(req, res) {
    // Check if the user is logged in and their username is stored in the session
    if (req.session.user && req.session.user.username) {
        // Send the username as a JSON response
        res.json(req.session.user.username);
    } else {
        // If the user is not logged in or their username is not available in the session, send an empty response
        res.json('');
    }
});
// Route to display home page
app.get('/home.html', function(req, res) {
    const username = req.query.username; // Get username from query parameter
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'home.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/search.html', function(req, res) {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'search.html')); 
    } else {
        res.redirect('/');
    }
});
app.get('/search', function(req, res) {
    
    const query = req.query.query;
    const sql = `SELECT * FROM item WHERE LOWER(title) LIKE '%${query}%'`;

    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error executing search query:', err);
            res.status(500).send('Error searching for products');
        } else {
            res.json(results);
        }
    });
});
app.get('/process_detail', function (req, res) {
    const title = req.query.title;
    // Query your database to fetch price based on the title
    // Example query:
    const sql = `SELECT price FROM item WHERE title = '${title}'`;
    // Execute the query and send back the response
    con.query(sql, function (err, result) {
        if (err) {
            console.error('Error fetching price:', err);
            res.status(500).json({ error: 'Error fetching price' });
        } else {
            if (result.length > 0) {
                res.json({ price: result[0].price });
            } else {
                res.status(404).json({ error: 'Price not found for the given title' });
            }
        }
    });
});
/*app.get('/home.html', function(req, res) {
    // Check if username is provided in the query parameters
    const { username } = req.query;
    if (username) {
        // Set username in session
        req.session.user = { username };
        // Render home.html and pass the username to the template
        res.render('home.html', { username });
    } else {
        // If username is not provided, redirect to login page
        res.redirect('/');
    }
});*/

app.get('/register.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'register.html')); // Send the register.html file
});
app.post('/register.html', function(req, res) {
    const { username, password, email } = req.body;

    const user = {
        username: username,
        password: password,
        email: email,
        role: 'customer'
    };

    connection.query('INSERT INTO users SET ?', user, function(error, results, fields) {
        if (error) {
            return res.status(500).send('Error while registering user');
        }
        res.send('<script>alert("Data saved successfully!"); window.location="/login.html";</script>');
    });
});
app.get('/product.html', function(req, res) {
    // Query to fetch product data from database
    const query = 'SELECT * FROM item';

    // Execute query
    connection.query(query, function(error, results, fields) {
        if (error) {
            console.log('Error fetching product data:', error);
            res.status(500).send('Error fetching product data');
            return;
        }

        // Render product.ejs template with product data
        res.render('product', { products: results });
    });
});
/*app.get('/manage_product', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'manage_product.html'));
});*/
app.get('/logout.html', function(req, res) {
    // Destroy the session to log the user out
    req.session.destroy(function(err) {
        if (err) {
            console.error('Error destroying session:', err);
        }
        // Redirect the user to the login page after logout
        res.redirect('/login.html');
    });
});
app.get('/cart.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'cart.html'));
});


app.post('/process_cart', function(req, res) {
    const customer = req.body.customer;
    const items = req.body.items; // Expecting items to be an array of { name, quantity }

    if (!items || items.length === 0) {
        return res.status(400).send('No items in the cart.');
    }

    let total = 0;
    const itemPromises = items.map(item => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT price FROM item WHERE title = ?';
            con.query(sql, [item.name], function(err, results) {
                if (err) return reject(err);
                if (results.length === 0) return reject(new Error(`Item not found: ${item.name}`));
                const price = results[0].price;
                total += price * item.quantity;
                resolve({ name: item.name, quantity: item.quantity, price });
            });
        });
    });

    Promise.all(itemPromises)
        .then(itemDetails => {
            const sql = 'INSERT INTO `order` (cust_name, total) VALUES (?, ?)';
            con.query(sql, [customer, total], function(err, result) {
                if (err) return res.status(500).send('Error creating order.');

                const orderId = result.insertId;
                const orderLinePromises = itemDetails.map(item => {
                    const sql = 'INSERT INTO orderline (order_id, item_name, item_quant, item_price) VALUES (?, ?, ?, ?)';
                    return new Promise((resolve, reject) => {
                        con.query(sql, [orderId, item.name, item.quantity, item.price], function(err) {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });

                Promise.all(orderLinePromises)
                    .then(() => {
                        res.send('Order successfully created.');
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).send('Error creating order lines.');
                    });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error processing items.');
        });
});

/*app.get('/logout.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'logout.html'));
});*/

// Set up your other routes and middleware here

// Start the server
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});

// Handle form submission for adding a product
app.post('/add_product', function(req, res) {
    // Extract product details from the request body
    const { title, description, price } = req.body;

    // Construct the SQL query to insert the product into the database
    const sql = 'INSERT INTO item (title, description, price) VALUES (?, ?, ?)';
    
    // Execute the SQL query
    connection.query(sql, [title, description, price], function(error, results, fields) {
        if (error) {
            console.error('Error adding product:', error);
            return res.status(500).send('Error adding product');
        }

        console.log('Product added successfully');
        return res.redirect('/manage_product.html'); // Redirect back to the manage_product.html page after adding the product
    });
});

app.get('/product.html', function(req, res) {
    const sql = 'SELECT * FROM item';

    connection.query(sql, function(error, results) {
        if (error) {
            console.error('Error fetching product data:', error);
            return res.status(500).send('Error fetching product data');
        }

        // Render the product.html template and pass the product data to it
        res.render('product.html', { products: results });
    });
});


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

app.use(function(req, res, next) {
    res.status(404).send('Page not found');
});


