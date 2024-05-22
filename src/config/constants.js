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
  REGULAR: { value: 0, label: "PENDING" },
  PROBATIONAL: { value: 1, label: "DONE" },
  INTERN: { value: 2, label: "UNDER REVIEW" },
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

export { Role, UserStatus, TaskStatus, IsActive };
