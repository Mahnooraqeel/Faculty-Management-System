document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = urlParams.get('id'); // Get teacher ID from query string

    if (!teacherId) {
        alert('No teacher ID provided. Please select a teacher first.');
        window.location.href = '/select_teacher.html'; // Redirect to the selection page
        return;
    }

    // Fetch teacher data using the ID
    fetch(`/teacher/${teacherId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Populate form fields with teacher data
            document.getElementById('name').value = data.name || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('CNIC').value = data.CNIC || '';
            document.getElementById('department').value = data.department || '';
            document.getElementById('date_of_joining').value = data.date_of_joining || '';
            document.getElementById('latest_academic_degree').value = data.latest_academic_degree || '';
            document.getElementById('expertise').value = data.expertise || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('password').value = data.password || '';
            document.getElementById('contact').value = data.contact || '';
            document.getElementById('landline').value = data.landline || '';
            document.getElementById('status').value = data.status || '';
        })
        .catch((error) => {
            console.error('Error fetching teacher data:', error);
            alert('Failed to fetch teacher data. Please try again later.');
        });

    // Handle form submission
    const form = document.getElementById('editTeacherForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        // Gather form data into an object
        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        fetch(`/update_teacher/${teacherId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        })
            .then((response) => {
                if (response.ok) {
                    alert('Teacher updated successfully');
                    window.location.href = '/admindashboard'; // Redirect to admin dashboard
                } else {
                    return response.text().then((message) => {
                        throw new Error(message || 'Failed to update teacher');
                    });
                }
            })
            .catch((error) => {
                console.error('Error updating teacher:', error);
                alert(`Error updating teacher: ${error.message}`);
            });
    });
});
