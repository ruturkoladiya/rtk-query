import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../features/users/userApi";
import { toast } from "react-toastify";
import { useState, useMemo } from "react";
import UserModal from "./UserModal";
import { Button, Popconfirm, Table, Tag, Input, Select } from "antd";
import useDebounce from "../../hook/useDebounce";

const UserList = () => {
  const { data: users, isError, isLoading, error } = useGetUsersQuery();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { Search } = Input;

  const [editId, setEditId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const debounceText = useDebounce(searchText, 100);

  const selectedUser = useMemo(() => {
    if (!users || !editId || editId === "new") return null;
    return users?.find((user) => user.id === editId);
  });

  const handleAddUser = () => setEditId("new");
  const handleEditUser = (id) => setEditId(id);
  const handleCloseModal = () => setEditId(null);

  const handleSubmit = async (values) => {
    try {
      if (editId !== "new") {
        const originalUser = users.find((user) => user.id === editId);

        const isUnchanged =
          originalUser.name === values.name &&
          originalUser.email === values.email &&
          originalUser.isAdmin === values.isAdmin;

        if (isUnchanged) {
          toast.info("No changes detected");
          return;
        }
        await updateUser({ ...values, id: editId }).unwrap();
        toast.success("User updated successfully!");
      } else {
        await addUser(values).unwrap();
        toast.success("User added successfully!");
      }
      setEditId(null);
    } catch (err) {
      console.error("mutation failed", err);
      toast.error("Something went wrong!");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return;

    return users.filter((user) => {
      const isMatchSearch =
        user.name.toLowerCase().includes(debounceText.toLowerCase()) ||
        user.email.toLowerCase().includes(debounceText.toLowerCase());

      const isRoleMatch =
        roleFilter === "all"
          ? true
          : roleFilter === "admin"
          ? user.isAdmin
          : !user.isAdmin;

      return isMatchSearch && isRoleMatch;
    });
  }, [users, debounceText, roleFilter]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "name",
      align: "center",
    },
    {
      title: "Admin",
      dataIndex: "isAdmin",
      key: "isAdmin",
      align: "center",
      render: (isAdmin) => (
        <Tag color={isAdmin ? "green" : "red"}>{isAdmin ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, user) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="primary"
            className="bg-yellow-400"
            onClick={() => handleEditUser(user.id)}
          >
            Update
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={async () => {
              try {
                await deleteUser(user.id).unwrap();
                toast.success("User deleted successfully!");
              } catch (err) {
                console.error("Delete failed:", err);
                toast.error("Failed to delete user");
              }
            }}
            okText="Yes"
            cancelText="No"
            disabled={user.isAdmin}
          >
            <Button type="primary" danger disabled={user.isAdmin}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="text-red-600 font-semibold text-center mt-10">
        Error: {error.toString()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 py-6">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl text-center font-bold text-gray-800">
          User Management
        </h1>
        <div className="mt-2 flex justify-end">
          <Button type="primary" onClick={handleAddUser}>
            + Add User
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Search
            placeholder="Search by name or email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            enterButton
            allowClear
            className="max-w-md"
          />
          <Select
            defaultValue="all"
            className="w-48"
            onChange={(value) => setRoleFilter(value)}
            options={[
              { label: "All Users", value: "all" },
              { label: "Admins", value: "admin" },
              { label: "Non-Admins", value: "non-admin" },
            ]}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500 text-lg">
          Loading users...
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </div>
      )}

      {editId !== null && (
        <UserModal
          onClose={() => handleCloseModal()}
          onSubmit={handleSubmit}
          editData={editId === "new" ? null : selectedUser}
          isEdit={editId !== "new"}
        />
      )}
    </div>
  );
};

export default UserList;
