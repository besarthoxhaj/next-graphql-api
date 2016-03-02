export default func =>
	value => {
		func.call(null, value);
		return value;
	};
