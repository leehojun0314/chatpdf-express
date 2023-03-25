const getSql = require('../database/connection');
function selectMessage_convInfo({ convId }) {
	return new Promise((resolve, reject) => {
		getSql().then((sqlPool) => {
			sqlPool.request().query(``);
		});
	});
}
