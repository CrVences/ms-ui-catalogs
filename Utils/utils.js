//* Función para crear el templateForm dinámicamente para buscatálogos

const createTemplateForm = (data) => {
	const template = [
		{
			key: "mcc",
			label: "MCC",
			required: false,
			min: null,
			max: null,
			email: false,
			regExp: null,
			controlType: "text",
			type: "text",
			options: [],
			disabled: false,
		},
		{
			key: "description",
			label: "Descripcion",
			required: false,
			min: null,
			max: null,
			email: false,
			regExp: null,
			controlType: "text",
			type: "text",
			options: [],
			disabled: false,
		},
	];

	return template.map((item) => ({
		...item,
		value: data[item.key] || "",
	}));
};

const convertValuesToString = (data) => {
	return Object.keys(data).reduce((acc, key) => {
		acc[key] = String(data[key]);
		return acc;
	}, {});
};

module.exports = {
	createTemplateForm,
	convertValuesToString,
};
