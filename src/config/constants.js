const Role = {
  ADMIN_MANAGER: { value: 0, label: "Admin" },
  USER: { value: 1, label: "User" },
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

export { Role, UserStatus, IsActive };
