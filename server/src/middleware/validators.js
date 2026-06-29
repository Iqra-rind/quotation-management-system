import { body, validationResult } from "express-validator";

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
  }
  next();
}

export const validateVendor = [
  body("vendor_name").trim().notEmpty().withMessage("Vendor name is required."),
  body("company_name").trim().notEmpty().withMessage("Company name is required."),
  body("email").trim().isEmail().withMessage("A valid email address is required."),
  body("contact_number")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required.")
    .matches(/^[\d+\-\s()]{6,20}$/)
    .withMessage("Enter a valid contact number."),
  body("business_address").trim().notEmpty().withMessage("Business address is required."),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive."),
  handleValidation,
];

export const validateVendorUpdate = [
  body("vendor_name").optional().trim().notEmpty().withMessage("Vendor name cannot be empty."),
  body("company_name").optional().trim().notEmpty().withMessage("Company name cannot be empty."),
  body("email").optional().trim().isEmail().withMessage("A valid email address is required."),
  body("contact_number")
    .optional()
    .trim()
    .matches(/^[\d+\-\s()]{6,20}$/)
    .withMessage("Enter a valid contact number."),
  body("business_address").optional().trim().notEmpty().withMessage("Business address cannot be empty."),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive."),
  handleValidation,
];

export const validateQuotationRequest = [
  body("title").trim().notEmpty().withMessage("Quotation title is required."),
  body("vendor_ids").isArray({ min: 1 }).withMessage("Select at least one vendor."),
  handleValidation,
];

export const validateQuotationSubmit = [
  body("quotation_amount")
    .notEmpty()
    .withMessage("Quotation amount is required.")
    .isFloat({ gt: 0 })
    .withMessage("Quotation amount must be a positive number."),
  handleValidation,
];

export const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").trim().isEmail().withMessage("A valid email address is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("role").optional().isIn(["admin", "member"]).withMessage("Role must be admin or member."),
  handleValidation,
];

export const validateLogin = [
  body("email").trim().isEmail().withMessage("A valid email address is required."),
  body("password").notEmpty().withMessage("Password is required."),
  handleValidation,
];
