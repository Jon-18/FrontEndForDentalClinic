import { useEffect, useState } from "react";
import Table from "../Table";

const Users = () => {
  const [data, setData] = useState([]);

  const columns = [
    { key: "dateRegister", header: "Date Registered" },
    { key: "fullname", header: "Full Name" },
    { key: "username", header: "Username" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://sibongadentalfrontend.onrender.com/api/users");
        const users = await response.json();
        setData(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Table title="User Accounts" columns={columns} data={data} />
    </div>
  );
};

export default Users;
