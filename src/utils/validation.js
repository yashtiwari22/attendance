import Joi from "joi";

export const createUserSchema = Joi.object({
  display_name: Joi.string(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().required(),
  password: Joi.string().required().min(6),
  image_url: Joi.string(),
  designation: Joi.string().required(),
  department_id: Joi.number().required(),
  user_status: Joi.number().required(),
  is_active: Joi.number().required(),
  role_id: Joi.number().required(),
  created_at: Joi.date(),
  updated_at: Joi.date(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required()
    .min(6),
});
