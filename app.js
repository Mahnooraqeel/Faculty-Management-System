const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For handling form data

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'noor', // Replace with your MySQL password
    database: 'faculty_db', // Your database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Make sure 'index.html' exists in 'public' folder
});

app.get('/add_teachers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add_teachers.html'));
});
app.get('/update_teacher_profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update_teacher_profile.html'));
});

// Login route
app.post('/login', (req, res) => {
    const { role, email, password } = req.body;

    if (role === 'admin') {
        const query = 'SELECT * FROM admininfo WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Error fetching admin data:', err);
                return res.status(500).send('Server error');
            }

            if (results.length > 0) {
                const admin = results[0];
                if (password === admin.password) {
                    console.log('Admin login successful');
                    return res.json({ success: true, redirect: '/admindashboard' }); // Redirect on success
                } else {
                    return res.status(401).send('Invalid admin credentials');
                }
            } else {
                return res.status(404).send('Admin not found');
            }
        });
    } else if (role === 'teacher') {
        const query = 'SELECT * FROM TeacherInfo WHERE email = ? AND status = "1"';
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Error fetching teacher data:', err);
                return res.status(500).send('Server error');
            }

            if (results.length > 0) {
                const teacher = results[0];
                if (password === teacher.password) {
                    console.log('Teacher login successful');
                    return res.json({ success: true, redirect: '/teacherdashboard' }); // Redirect on success
                } else {
                    return res.status(401).send('Invalid teacher credentials');
                }
            } else {
                return res.status(404).send('Teacher not found or inactive');
            }
        });
    } else {
        return res.status(400).send('Invalid role selected');
    }
});

app.post('/validate-teacher-cnic', (req, res) => {
    const { cnic } = req.body; // Get the CNIC entered by the teacher

    const query = 'SELECT * FROM TeacherInfo WHERE CNIC = ?';

    db.query(query, [cnic], (err, results) => {
        if (err) {
            console.error('Error validating CNIC:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Teacher with provided CNIC not found' });
        }

        res.json({ message: 'CNIC verified. You can now edit your information.', teacher: results[0] });
    });
});

// Define a route to update teacher information based on CNIC
app.post('/update-teacher-info', (req, res) => {
    const { cnic, name, expertise, contact, landline } = req.body;

    const updateQuery = `
        UPDATE TeacherInfo
        SET name = ?, expertise = ?, contact = ?, landline = ?
        WHERE CNIC = ?
    `;

    db.query(updateQuery, [name, expertise, contact, landline, cnic], (err, result) => {
        if (err) {
            console.error('Error updating teacher information:', err);
            return res.status(500).json({ error: 'Failed to update teacher information' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No teacher found with the provided CNIC' });
        }

        res.json({ message: 'Teacher information updated successfully' });
    });
});
// Define a route for the admin dashboard
app.get('/admindashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admindashboard.html'));
});

app.get('/teacherdashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacherdashboard.html'));
});

// 1. Get all teachers
app.get('/teachers', (req, res) => {
    const query = 'SELECT id, name FROM TeacherInfo'; // Fetch only id and name

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err); // Log any query errors
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            console.log('No teachers found'); // Log when no teachers are found
            return res.status(404).send('No teachers found');
        }

        res.json(results); // Send the teacher data (id and name) as a JSON response
    });
});

app.get('/teacher/:id', (req, res) => {
    const teacherId = parseInt(req.params.id, 10); // Convert id to an integer

    const query = 'SELECT * FROM TeacherInfo WHERE id = ?';
    db.query(query, [teacherId], (err, results) => {
        if (err) {
            console.error('Error fetching teacher:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            return res.status(404).send('Teacher not found');
        }

        // Pass the teacher data to the frontend for displaying in the form
        const teacher = results[0];
        res.json(teacher); // Return teacher data as JSON
    });
});

app.post('/update_teacher/:id', (req, res) => {
    const teacherId = req.params.id;
    const {
        name,
        age,
        CNIC,
        department,
        date_of_joining,
        latest_academic_degree,
        expertise,
        email,
        password,
        contact,
        landline,
        status,
    } = req.body;

    const query = `UPDATE TeacherInfo 
                   SET name = ?, age = ?, CNIC = ?, department = ?, date_of_joining = ?, 
                       latest_academic_degree = ?, expertise = ?, email = ?, 
                       password = ?, contact = ?, landline = ?, status = ? 
                   WHERE id = ?`;

    const values = [
        name,
        age,
        CNIC,
        department,
        date_of_joining,
        latest_academic_degree,
        expertise,
        email,
        password,
        contact,
        landline,
        status,
        teacherId,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating teacher:', err);
            return res.status(500).send('Failed to update teacher');
        }

        console.log('Teacher updated successfully:', result);
        res.redirect('/admindashboard'); // Redirect after successful update
    });
});

app.get('/delete_teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'delete_teacher.html'));
});
app.post('/delete_teacher', (req, res) => {
    const { teacherId } = req.body; // Get teacher ID from the form

    // Ensure teacherId is provided
    if (!teacherId) {
        return res.status(400).send('Teacher ID is required');
    }

    const query = 'DELETE FROM TeacherInfo WHERE id = ?';

    db.query(query, [teacherId], (err, result) => {
        if (err) {
            console.error('Error deleting teacher:', err);
            return res.status(500).send('Failed to delete teacher');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Teacher not found');
        }

        console.log('Teacher deleted successfully:', result);
        res.redirect('/admindashboard'); // Redirect after successful deletion
    });
});

app.get('/view_teachers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view_teachers.html'));
});
app.get('/view_teachers_active', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view_teachers_active.html'));
});

app.get('/teachers/:status', (req, res) => {
    const { status } = req.params;

    let query;
    const values = [];

    if (status === 'all') {
        query = 'SELECT * FROM TeacherInfo';
    } else if (status === 'active') {
        query = 'SELECT * FROM TeacherInfo WHERE status = ?';
        values.push(1); // Use numeric value for active status
    } else if (status === 'inactive') {
        query = 'SELECT * FROM TeacherInfo WHERE status = ?';
        values.push(0); // Use numeric value for inactive status
    } else {
        return res.status(400).send('Invalid status');
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching teachers:', err);
            return res.status(500).send('Failed to fetch teachers');
        }

        res.json(results); // Return the filtered list of teachers
    });
});


app.get('/view-teachers', (req, res) => {
    // Query to fetch only active teachers with required fields
    const query = 'SELECT name, email, department, expertise FROM TeacherInfo WHERE status = 1';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching teachers:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length > 0) {
            res.json(results); // Return the list of active teachers
        } else {
            res.status(404).json({ message: 'No active teachers found' });
        }
    });
});
// Define a route to add a new teacher
app.post('/teachers', (req, res) => {
    const {
        name,
        age,
        CNIC,
        department,
        date_of_joining,
        latest_academic_degree,
        expertise,
        email,
        password,
        contact,
        landline,
        status,
    } = req.body;

    const query = `
        INSERT INTO TeacherInfo (name, age, CNIC, department, date_of_joining, latest_academic_degree, expertise, email, password, contact, landline, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [name, age, CNIC, department, date_of_joining, latest_academic_degree, expertise, email, password, contact, landline, status];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error adding teacher:', err);

            // Determine the error type
            let message = 'An error occurred while adding the teacher. Please try again.';
            if (err.code === 'ER_DUP_ENTRY') {
                if (err.sqlMessage.includes('email')) {
                    message = 'The email provided is already in use. Please use a unique email.';
                } else if (err.sqlMessage.includes('CNIC')) {
                    message = 'The CNIC provided is already registered. Please use a unique CNIC.';
                }
            } else if (err.code === 'ER_BAD_NULL_ERROR') {
                message = 'One or more required fields are missing. Please fill in all mandatory fields.';
            } else if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
                message = 'Some inputs do not meet the required constraints. Please check the input lengths and values.';
            } else if (err.code === 'ER_DATA_TOO_LONG') {
                message = 'One or more fields exceed the allowed length. Please ensure the inputs are within valid limits.';
            }

            return res.status(400).json({ success: false, message });
        }

        console.log('Teacher added successfully:', result);
        res.json({ success: true, message: 'Teacher added successfully.' });
    });
});


// Server Listener
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
