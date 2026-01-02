import Table from "../Table";

const Users = () => {
  const columns = [
    { key: "dateService", header: "Date" },
    { key: "fullname", header: "Full Name" },
    { key: "username", header: "Username" },
    { key: "service", header: "Service" },
    { key: "phoneNumber", header: "Phone Number" },
  ];

  const data = [
    {
      dateService: "2025-10-22",
      fullname: "Jonathan",
      username: "admin",
      service: "Cleaning",
      phoneNumber: "09123456789",
    }
  ];

  return (
    <div>
      <Table title="Your History" columns={columns} data={data} />
    </div>
  );
};

export default Users;
