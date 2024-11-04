const express = require("express");
const {
	catalogResponse,
	catalogByCatalogResponse,
	showCatalogResponse,
	editByCatalogResponse,
	editSubCatalogByIdResponse,
	showSubCatalogByIdResponse,
	createSubCatalogResponse,
	createCatalogResponse,
	registerSubCatalogResponse,
} = require("../controllers/catalogController");

const router = express.Router();

router.get("/catalogs", catalogResponse);
router.get("/catalogsById", catalogByCatalogResponse);
router.get("/showByCatalog", showCatalogResponse);
router.get("/editByCatalog", editByCatalogResponse);
router.get("/createCatalog", createCatalogResponse);
router.get("/editSubCatalogById", editSubCatalogByIdResponse);
router.get("/showSubCatalogById", showSubCatalogByIdResponse);
router.get("/createSubCatalog", createSubCatalogResponse);
router.post("/registerSubCatalog", registerSubCatalogResponse);

module.exports = router;
