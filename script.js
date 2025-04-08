// script.js

const apiUrl = 'http://localhost:3000';

// Fetch teachers and display them
const fetchTeachers = async () => {
    try {
        const response = await fetch(`${apiUrl}/teachers`);
        const teachers = await response.json();
        const teacherList = document.getElementById('teachers');

        teacherList.innerHTML = ''; // Clear list before appending
        teachers.forEach(teacher => {
            const li = document.createElement('li');
            li.textContent = `${teacher.name} - ${teacher.department}`;
            teacherList.appendChild(li);
        });
    } catch (err) {
        console.error('Error fetching teachers:', err);
    }
};

// Add a new teacher
const addTeacher = async (event) => {
    event.preventDefault();

    const newTeacher = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        CNIC: document.getElementById('cnic').value,
        department: document.getElementById('department').value,
        date_of_joining: document.getElementById('date_of_joining').value,
        latest_academic_degree: document.getElementById('degree').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        contact: document.getElementById('contact').value,
        landline: document.getElementById('landline').value,
        status: 1, // Default to active
    };

    try {
        const response = await fetch(`${apiUrl}/teachers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTeacher),
        });

        if (response.ok) {
            alert('Teacher added successfully!');
            fetchTeachers(); // Refresh the teacher list
        } else {
            alert('Failed to add teacher');
        }
    } catch (err) {
        console.error('Error adding teacher:', err);
    }
};

// Attach event listeners
document.getElementById('addTeacherForm').addEventListener('submit', addTeacher);

// Fetch teachers on page load
fetchTeachers();
