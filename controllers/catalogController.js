const fs = require("fs");
const path = require("path");

const { createTemplateForm } = require("../Utils/utils");

const getDatabaseData = (dbPath) => {
	try {
		console.log("Leyendo el archivo en la ruta:", dbPath);
		const data = fs.readFileSync(dbPath, "utf-8");
		return JSON.parse(data);
	} catch (err) {
		console.error("Error al leer los datos:", err.message);
		throw new Error("Error al leer los datos del archivo JSON");
	}
};

const filterData = (data, { id, status, queryFilter }) => {
	let filteredData = data;

	if (id) {
		filteredData = filteredData.filter((item) => item.id === id);
	}

	if (status) {
		filteredData = filteredData.filter(
			(item) => item.status.toLowerCase() === status.toLowerCase()
		);
	}

	if (queryFilter) {
		filteredData = filteredData
			.map((catalog) => {
				const filteredCatalogItems = catalog.data.filter((item) => {
					const settlementMatch =
						item.settlement &&
						item.settlement.toLowerCase().includes(queryFilter);
					const codeMatch = item.id.toLowerCase().includes(queryFilter);
					const zipCodeMatch =
						item.zipCode &&
						item.zipCode.toLowerCase() === queryFilter.toLowerCase();
					const formMatch =
						Array.isArray(item.templateForm) &&
						item.templateForm.some((formItem) =>
							formItem.value
								? formItem.value.toString().toLowerCase().includes(queryFilter)
								: false
						);

					return settlementMatch || codeMatch || zipCodeMatch || formMatch;
				});

				return {
					...catalog,
					data: filteredCatalogItems,
				};
			})
			.filter((catalog) => catalog.data.length > 0);
	}

	return filteredData;
};

const paginateData = (data, page, size) => {
	const startIndex = (page - 1) * size;
	const endIndex = startIndex + size;
	return data.slice(startIndex, endIndex);
};

const buildResponse = (filteredData, page, size, catalogId, headers) => {
	const totalElements = filteredData.reduce(
		(total, catalog) => total + (catalog.data ? catalog.data.length : 0),
		0
	);

	const paginatedData = paginateData(
		filteredData.flatMap((catalog) => catalog.data),
		page,
		size
	);

	return {
		pageNumber: page,
		pageSize: size,
		totalElements,
		totalPages: Math.ceil(totalElements / size),
		id: catalogId,
		data: paginatedData,
		headers,
	};
};

//* Función para guardar datos en el archivo JSON
const saveDatabaseData = (dbPath, data) => {
	try {
		fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
	} catch (err) {
		console.error("Error al guardar los datos:", err.message);
		throw new Error("Error al guardar los datos en el archivo JSON");
	}
};

//* Función para crear un nuevo ID para subCatálogos
const generateNewId = (currentData) => {
	const newIdNumber = currentData.length + 1;
	return `001CD0${newIdNumber}`;
};

//* Función para obtener todos los catálogos
const catalogResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");
	const { size = 5, page = 1, status, queryFilter } = req.query;

	try {
		const dbData = getDatabaseData(dbPath);
		const filteredData = filterData(dbData.catalogsById.data, {
			status,
			queryFilter,
		});

		const response = buildResponse(
			filteredData,
			parseInt(page),
			parseInt(size),
			null,
			dbData.headersSubCatalogs
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

//* Función para obtener los datos subcatálogos
const catalogByCatalogResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");
	const { size = 5, page = 1, id, status, queryFilter } = req.query;

	try {
		const dbData = getDatabaseData(dbPath);
		const filteredData = filterData(dbData.catalogsById.data, {
			id,
			status,
			queryFilter,
		});

		const headers =
			dbData.headersSubCatalogs.find((header) => header.id === id) || [];
		const response = buildResponse(
			filteredData,
			parseInt(page),
			parseInt(size),
			id,
			headers.headers
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

//* Función para ver los datos de un catálogo
const showCatalogResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");

	try {
		const dbData = getDatabaseData(dbPath);
		const catalogId = req.query.id;

		if (!catalogId) {
			return res.status(400).send("ID de catálogo no proporcionado");
		}

		const registerCatalogs = dbData.showByCatalog || [];
		const catalog = registerCatalogs.find((item) => item.id === catalogId);

		if (!catalog) {
			return res.status(404).send("Catálogo no encontrado");
		}

		const { id, templateForm } = catalog;
		const response = {
			id,
			data: templateForm,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error("Error en showCatalogResponse:", err.message);
		return res.status(500).send("Error al leer los datos del catálogo");
	}
};

//* Función para crear un catálogo
const createCatalogResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");

	try {
		const dbData = getDatabaseData(dbPath);
		const registerCatalogs = dbData.createCatalog || [];

		if (registerCatalogs.length === 0) {
			return res.status(404).send("No se encontraron catálogos para crear");
		}

		const { templateForm } = registerCatalogs[0];

		const response = {
			data: templateForm,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error("Error en createCatalogResponse:", err.message);
		return res.status(500).send("Error al leer los datos del catálogo");
	}
};

//* Función editar catálogos
const editByCatalogResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");

	try {
		const dbData = getDatabaseData(dbPath);
		const catalogId = req.query.id;

		if (!catalogId) {
			return res.status(400).send("ID de catálogo no proporcionado");
		}

		const editCatalogs = dbData.editByCatalog || [];
		const catalog = editCatalogs.find((item) => item.id === catalogId);

		if (!catalog) {
			return res.status(404).send("Catálogo no encontrado");
		}

		const { id, templateForm } = catalog;
		const response = {
			id,
			data: templateForm,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error("Error en editByCatalogResponse:", err.message);
		return res.status(500).send("Error al leer los datos del catálogo");
	}
};

//* Función para editar subcatálogos
const editSubCatalogByIdResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");

	try {
		const dbData = getDatabaseData(dbPath);
		const catalogId = req.query.id;

		if (!catalogId) {
			return res.status(400).send("ID de subcatálogo no proporcionado");
		}

		const editSubCatalogs = dbData.editSubCatalogById || [];
		const catalog = editSubCatalogs.find((item) => item.id === catalogId);

		if (!catalog) {
			return res.status(404).send("Subcatálogo no encontrado");
		}

		const { id, templateForm } = catalog;
		const response = {
			id,
			data: templateForm,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error("Error en editSubCatalogByIdResponse:", err.message);
		return res.status(500).send("Error al leer los datos del subcatálogo");
	}
};

//* Función para ver los datos de un subcatálogo
const showSubCatalogByIdResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");

	try {
		const dbData = getDatabaseData(dbPath);
		const catalogId = req.query.id;

		if (!catalogId) {
			return res.status(400).send("ID de subcatálogo no proporcionado");
		}

		const registerCatalogs = dbData.showSubCatalogById || [];
		const catalog = registerCatalogs.find((item) => item.id === catalogId);

		if (!catalog) {
			return res.status(404).send("Subcatálogo no encontrado");
		}

		const { id, templateForm } = catalog.data[0];
		const response = {
			id,
			data: templateForm,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error("Error en showSubCatalogByIdResponse:", err.message);
		return res.status(500).send("Error al leer los datos del subcatálogo");
	}
};

//* Función para crear un subCatálogo
const createSubCatalogResponse = (req, res) => {
	const dbPath = path.join(__dirname, "../db.json");

	try {
		const dbData = getDatabaseData(dbPath);
		const catalogId = req.query.id;

		if (!catalogId) {
			return res.status(400).send("ID de subcatálogo no proporcionado");
		}

		const registerCatalogs = dbData.createSubCatalog || [];
		const catalog = registerCatalogs.find((item) => item.id === catalogId);

		if (!catalog) {
			return res.status(404).send("Catálogo no encontrado");
		}

		const { id, templateForm } = catalog;
		const response = {
			id,
			data: templateForm,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error("Error en createSubCatalogResponse:", err.message);
		return res.status(500).send("Error al leer los datos del catálogo");
	}
};

//* Función para guardar/registrar un nuevo subcatálogo
const registerSubCatalogResponse = (req, res) => {
	console.log("Datos recibidos:", req.body);

	const dbPath = path.join(__dirname, "../db.json");

	if (!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).send("No se recibieron datos.");
	}

	try {
		const dbData = getDatabaseData(dbPath);
		const catalogEntry = dbData.catalogsById.data.find(
			(entry) => entry.id === "006"
		);

		if (!catalogEntry) {
			return res.status(404).send("No se encontró el catálogo con id 006.");
		}

		const currentData = catalogEntry.data || [];
		const newId = generateNewId(currentData);

		const newCatalogItem = {
			id: newId,
			mcc: req.body.mcc,
			description: req.body.description,
			templateForm: createTemplateForm(req.body),
		};

		catalogEntry.data.push(newCatalogItem);

		saveDatabaseData(dbPath, dbData);

		return res.status(201).json(newCatalogItem);
	} catch (err) {
		console.error("Error en registerSubCatalogResponse:", err.message);
		return res.status(500).send("Error al procesar la solicitud.");
	}
};

module.exports = {
	catalogResponse,
	catalogByCatalogResponse,
	showCatalogResponse,
	createCatalogResponse,
	editByCatalogResponse,
	editSubCatalogByIdResponse,
	showSubCatalogByIdResponse,
	createSubCatalogResponse,
	registerSubCatalogResponse,
};
