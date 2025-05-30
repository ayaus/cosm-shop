const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct, 
  deleteProduct  
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

router.post("/", authMiddleware, checkRole("admin", "superadmin"), createProduct);
router.put("/:id", authMiddleware, checkRole("admin", "superadmin"), updateProduct);
router.delete("/:id", authMiddleware, checkRole("admin", "superadmin"), deleteProduct); 


router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
