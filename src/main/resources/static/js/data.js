window.mockEmployees = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    department: "HR",
    role: "Recruiter"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    department: "IT",
    role: "Developer"
  }
  // ...add more if needed
];

// Store only if not already in localStorage
if (!localStorage.getItem("employees")) {
  localStorage.setItem("employees", JSON.stringify(mockEmployees));
}
