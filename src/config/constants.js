const Role = {
  ADMIN_MANAGER: { value: 0, label: "Admin" },
  USER: { value: 1, label: "Employee" },
  getLabel: function (value) {
    return Object.values(this).find((role) => role.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((role) => role.label === label)?.value;
  },
};

const UserDepartment = {
  Development: { value: 0, label: "DEVELOPMENT" },
  Hr: { value: 1, label: "HR" },
  Qa: { value: 1, label: "QA" },
  Sales: { value: 1, label: "SALES" },
  getLabel: function (value) {
    return Object.values(this).find((role) => role.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((role) => role.label === label)?.value;
  },
};

const UserStatus = {
  REGULAR: { value: 0, label: "Regular" },
  PROBATIONAL: { value: 1, label: "Probational" },
  INTERN: { value: 2, label: "Intern" },
  getLabel: function (value) {
    return Object.values(this).find((status) => status.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((status) => status.label === label)?.value;
  },
};

const TaskStatus = {
  PENDING: { value: 0, label: "PENDING" },
  DONE: { value: 1, label: "DONE" },
  UNDER_REVIEW: { value: 2, label: "UNDER_REVIEW" },
  getLabel: function (value) {
    return Object.values(this).find((status) => status.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((status) => status.label === label)?.value;
  },
};

const LeaveStatus = {
  PENDING: { value: 0, label: "PENDING" },
  APPROVED: { value: 1, label: "APPROVED" },
  REJECTED: { value: 2, label: "REJECTED" },
  getLabel: function (value) {
    return Object.values(this).find((status) => status.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((status) => status.label === label)?.value;
  },
};

const LeaveType = {
  Casual: { value: 0, label: "Casual" },
  Annual: { value: 1, label: "Annual" },
  getLabel: function (value) {
    return Object.values(this).find((status) => status.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((status) => status.label === label)?.value;
  },
};

const IsActive = {
  ACTIVE: { value: 0, label: "Inactive" },
  INACTIVE: { value: 1, label: "Active" },
  getLabel: function (value) {
    return Object.values(this).find((status) => status.value === value)?.label;
  },
  getValue: function (label) {
    return Object.values(this).find((status) => status.label === label)?.value;
  },
};

export {
  Role,
  UserDepartment,
  UserStatus,
  TaskStatus,
  LeaveStatus,
  LeaveType,
  IsActive,
};
