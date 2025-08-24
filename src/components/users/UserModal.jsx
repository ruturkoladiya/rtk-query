import { Modal } from "antd";
import { useFormik } from "formik";
import { validationSchema } from "../../utils/validation";

const UserModal = ({ onClose, onSubmit, editData, isEdit }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: editData || {
    name: "",
    email: "",
    isAdmin: false,
  },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await onSubmit(values);
      resetForm();
      onClose();
    },
  });

  return (
    <Modal
      title={
        <h2 className="text-xl font-semibold text-blue-500">
          {isEdit ? "Update User" : "Add New User"}
        </h2>
      }
      open={true}
      onCancel={onClose}
      mask={true}
      footer={null}
    >
      <form onSubmit={formik.handleSubmit} className="mt-4 text-sm space-y-2">
        <label htmlFor="name" className="block font-medium mb-1">
          Name<span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          placeholder="Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-red-600">{formik.errors.name}</p>
        )}

        <label htmlFor="email" className="block font-medium mb-1">
          Email<span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Email"
          className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-600">{formik.errors.email}</p>
        )}

        <label htmlFor="role" className="block font-medium mb-1">
          Role
        </label>
        <select
          id="role"
          name="isAdmin"
          disabled={isEdit && formik.values.isAdmin}
          value={formik.values.isAdmin ? "Admin" : "User"}
          onChange={(e) =>
            formik.setFieldValue("isAdmin", e.target.value === "Admin")
          }
          className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            formik.values.isAdmin && isEdit && "cursor-not-allowed bg-gray-100"
          }`}
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-400 cursor-pointer"
          disabled={formik.isSubmitting}
        >
          {isEdit ? "Update" : "Add"} User
        </button>
      </form>
    </Modal>
  );
};

export default UserModal;
