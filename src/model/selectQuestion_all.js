const getSql = require('../database/connection');
function selectQuestion_all({ convIntId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(`SELECT * FROM Question WHERE id = '${convIntId}'`)
					.then((result) => {
						resolve(result.recordset);
					})
					.catch((err) => {
						reject(err);
					});
			})
			.catch((err) => {
				reject(err);
			});
	});
}
module.exports = selectQuestion_all;
